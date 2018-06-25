#include <eosiolib/asset.hpp>
#include <eosiolib/contract.hpp>
#include <eosiolib/crypto.h>
#include <eosiolib/currency.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/multi_index.hpp>
#include <iostream>
#include <string>
#include <time.h>
#include <utility>
#include <vector>
using namespace eosio;
using std::string;

class lottery : public eosio::contract
{

  public:
	using contract::contract;
	lottery(account_name self)
		: eosio::contract(self), games(_self, _self), bettings(_self, _self) {}
	/** 创建一局游戏,指定本局游戏筹码数量
	* @abi action
	*/
	void creategame(asset prize_pool, asset betting_value, uint16_t max_player)
	{
		require_auth(_self); //必须是我们自己
		innercreate(prize_pool, betting_value, max_player);
	}

	/** 玩家加入游戏
	* quantity 一次投注多少
	* id 表示加入哪局游戏
	* @abi action
	*/
	void join(account_name name, uint64_t g_id)
	{
		require_auth(name);
		auto curr_game = games.find(g_id);
		eosio_assert(curr_game != games.end(), "the game dose not exist");

		eosio_assert(curr_game->current_index < curr_game->max_player &&
						 curr_game->current_index >= 0,
					 "reached the maximum number of player");
		eosio_assert(curr_game != games.end(), "game dose not exist");
		eosio_assert(curr_game->current_index < curr_game->max_player,
					 "reached the maximum number of player");
		action(permission_level{name, N(active)}, N(eosio.token), N(transfer),
			   std::make_tuple(name, _self, curr_game->betting_value,
							   std::string("bet")))
			.send();
		innerjoin(name, *curr_game);
	}

	/** 开奖
	** @abi action
	*/
	void open(uint64_t g_id)
	{
		require_auth(_self);
		inneropen(g_id);
	}

	/**
	* 游戏一直未满，管理员主动结束，返回资金给竞猜者
	* @abi action
	*/
	void stopgame(uint64_t g_id)
	{
		require_auth(_self);
		auto itr = games.find(g_id);
		eosio_assert(itr != games.end(), "the game dose not exist");
		eosio_assert(itr->end != true, "the game is over");

		auto betting_index = bettings.get_index<N(bygid)>();
		auto game_bettings = betting_index.find(g_id);
		while (game_bettings != betting_index.end() &&
			   game_bettings->g_id == g_id)
		{
			//返还用户金额
			action(permission_level{_self, N(active)}, N(eosio.token), N(transfer),
				   std::make_tuple(_self, game_bettings->player_name,
								   game_bettings->bet, string("")))
				.send();
			++game_bettings;
		}
		games.modify(itr, _self, [&](auto &g) { g.end = true; });
	}

	/**支付失败的情况下从改局游戏中移除,这种情况不会存在
	* @abi action
	*/
	void removebetting(uint64_t g_id, uint64_t b_id)
	{
		auto itr = games.find(g_id);
		eosio_assert(itr != games.end(), "the game dose not exist");

		auto betting_index = bettings.get_index<N(bygid)>();
		auto game_bettings = betting_index.find(g_id);
		while (game_bettings != betting_index.end() &&
			   game_bettings->g_id == g_id)
		{
			auto betting = bettings.find(game_bettings->b_id);
			if (betting->b_id == b_id)
			{
				eosio::print("cancel betting: ", b_id,
							 eosio::name{betting->player_name});
				bettings.erase(betting);
				games.modify(itr, _self,
							 [&](auto &g) { g.current_index = g.current_index - 1; });
				break;
			}
			eosio::print("currently placed bet:", eosio::name{betting->player_name},
						 "betting id:", game_bettings->b_id);
			++game_bettings;
		}
	}
	void transfer(uint64_t sender, uint64_t receiver)
	{
		print("\n>>> sender >>>", sender, " - name: ", name{sender});
		print("\n>>> receiver >>>", receiver, " - name: ", name{receiver});

		// ??? Don't need to verify because we already did it in EOSIO_ABI_EX ???
		// eosio_assert(code == N(eosio.token), "I reject your non-eosio.token deposit");

		auto transfer_data = unpack_action_data<st_transfer>();
		if (transfer_data.from == _self || transfer_data.to != _self)
		{
			return;
		}

		print("\n>>> transfer data quantity >>> ", transfer_data.quantity);

		// eosio_assert(transfer_data.quantity.symbol == string_to_symbol(4, "EOS"),
		// eosio_assert(transfer_data.quantity.symbol == CORE_SYMBOL,
		// 			 "lottery only accepts EOS for deposits");
		eosio_assert(transfer_data.quantity.is_valid(), "Invalid token transfer");
		eosio_assert(transfer_data.quantity.amount > 0, "Quantity must be positive");
		if (transfer_data.quantity.symbol == CORE_SYMBOL)
		{
			auto curr_game = games.rbegin();
			uint32_t max = transfer_data.quantity.amount / curr_game->betting_value.amount;
			print("\n>>> max bet number:>>>", max);
			print("\n>>> transfer_data.quantity.amount >>>", transfer_data.quantity.amount, " - curr_game->betting_value.amount: ", curr_game->betting_value.amount);
			print("\n>>> curr game_idx >>>", curr_game->g_id, " - name: ", name{sender});
			for (uint32_t i = 0; i < max; i++)
			{
				innerjoin(sender, *curr_game);
			}
		}
		print("\n", name{transfer_data.from}, " receive fouds:       ", transfer_data.quantity);
		// print("\n", name{transfer_data.from}, " funds available: ", new_balance);
	}

  private:
	struct st_transfer
	{
		account_name from;
		account_name to;
		asset quantity;
		string memo;
	};
	struct basegame
	{
		uint64_t g_id;
		account_name winner;
		uint16_t end = false; //是否已经开奖
		time date = now();	//开始游戏时间
		auto primary_key() const { return g_id; }

		EOSLIB_SERIALIZE(basegame, (g_id)(winner)(end));
	};

	///@abi table lotterygame i64
	struct lotterygame : public basegame
	{
		uint16_t current_index; //当前参与玩家序号
		uint16_t max_player;	//本局玩家人数
		asset prize_pool;		//奖金池
		asset betting_value;	//每个投注金额固定
		EOSLIB_SERIALIZE(lotterygame, (g_id)(winner)(end)(date)(current_index)(
										  max_player)(prize_pool)(betting_value));
	};

	typedef eosio::multi_index<N(lotterygame), lotterygame> game_index;
	///@abi table betting i64
	struct betting
	{
		uint64_t b_id;			  //主键序号
		uint64_t g_id;			  //游戏 id
		account_name player_name; //玩家账户
		asset bet;				  //投注额度
		uint64_t lucky_number;	//投注号码
		time date = now();		  //投注时间
		auto primary_key() const { return b_id; }
		uint64_t game_id() const { return g_id; }
		// account_name player_name() const { return player_name; }
		EOSLIB_SERIALIZE(betting,
						 (b_id)(g_id)(player_name)(bet)(lucky_number)(date));
	};

	typedef eosio::multi_index<
		N(betting), betting,
		indexed_by<N(bygid), const_mem_fun<betting, uint64_t, &betting::game_id>>>
		betting_table_type;
	void inneropen(uint64_t g_id)
	{
		eosio::print("************* inneropen", "\n");
		auto itr = games.find(g_id);
		eosio_assert(itr != games.end(), "the game dose not exist");
		eosio_assert(itr->current_index == itr->max_player,
					 "wrong number of players cannot start the game");
		game_rule(g_id);
	}
	/** 创建一局游戏,指定本局游戏筹码数量
	* @abi action
	*/
	void innercreate(const asset &prize_pool, const asset &betting_value,
					 uint16_t max_player)
	{
		// eosio_assert(max_player < 100 && max_player >= 0,
		//"number of players  beyond the limit(100)");
		eosio_assert(prize_pool.is_valid(), "Invalid prize_pool");
		eosio_assert(prize_pool.amount > 0, "prize_pool must be positive");
		eosio_assert(betting_value.is_valid(), "Invalid betting_value");
		eosio_assert(betting_value.amount > 0, "betting_value must be positive");
		eosio::print("innercreate: prize_pool amount:", prize_pool.amount,
					 " betting_value:", betting_value.amount, " max_player:",
					 (uint64_t)max_player, "\n");

		games.emplace(_self, [&](auto &g) {
			g.g_id = games.available_primary_key();
			g.current_index = 0;
			g.prize_pool = prize_pool;
			g.max_player = max_player;
			g.betting_value = betting_value;
		});
	}
	void game_rule(uint64_t g_id)
	{
		auto game = games.find(g_id);
		eosio_assert(game != games.end(), "the game dose not exist");
		auto betting_index = bettings.get_index<N(bygid)>();
		auto curr_game_bettings = betting_index.find(g_id);
		eosio::print("************** game_rule", "\n");
		// 随机出获奖号码，这里有隐患
		time date = now();
		// srand(date);
		// auto lucky_number = rand() % 100 + 1;
		checksum256 lucky_key;
		sha256((char *)&date, sizeof(time), &lucky_key);
		eosio::print("lucky_key:");
		for (uint32_t i = 0; i < 32; i++)
		{
			eosio::print((uint32_t)lucky_key.hash[i]);
		}
		eosio::print("     **********\n");
		auto lucky_number =
			(lucky_key.hash[0] + lucky_key.hash[10] + lucky_key.hash[16]) %
				game->max_player +
			1;
		eosio::print(char(lucky_key.hash[0]), char(lucky_key.hash[10]),
					 char(lucky_key.hash[16]), "\n");
		eosio::print("the lucky number*******:", lucky_number, "\n");
		account_name winner;
		while (curr_game_bettings != betting_index.end() &&
			   curr_game_bettings->g_id == g_id)
		{
			auto lucky_betting = bettings.find(curr_game_bettings->b_id);

			if (lucky_betting->lucky_number == lucky_number)
			{
				winner = lucky_betting->player_name;
				eosio::print("the winner:", eosio::name{winner},
							 "the winning betting id:", lucky_betting->b_id, "\n");
				//发奖励
				action(permission_level{_self, N(active)}, N(eosio.token), N(transfer),
					   std::make_tuple(_self, winner, game->prize_pool,
									   std::string("winner")))
					.send();
				break;
			}
			else
			{
				eosio::print("unlucky!!! placed bet:",
							 eosio::name{lucky_betting->player_name}, "betting id:",
							 lucky_betting->b_id, "\n");
			}
			++curr_game_bettings;
		}
		//当前轮游戏结束
		games.modify(game, _self, [&](auto &g) {
			g.winner = winner;
			g.end = true;
		});

		// 开始新一轮的游戏
		// creategame(core_from_string("100.0000"), 100);
		innercreate(game->prize_pool, game->betting_value, game->max_player);
		// creategame(eosio::chain::asset::from_string("100.0000" " "
		// CORE_SYMBOL_NAME), 100);
	}
	void innerjoin(const account_name &name, const lotterygame &game)
	{
		auto betting_index = bettings.get_index<N(bygid)>();
		auto curr_game_bettings = betting_index.find(game.g_id);
		// 当前玩家数加1
		games.modify(game, _self,
					 [&](auto &g) { g.current_index = g.current_index + 1; });

		time date = now();
		//具体玩家为scope建表，这里要关注 ram 的使用情况，应该使用的合约开发者的 ram
		// 当前玩家投注数据记录
		auto betting_record_index = betting_table_type(_self, name);
		// _bettings_append(betting_record_index);
		betting_record_index.emplace(_self, [&](auto &b) {
			b.b_id = bettings.available_primary_key();
			b.g_id = game.g_id;
			b.player_name = name;
			b.bet = game.betting_value;
			b.lucky_number = game.current_index; //暂时定为成玩家加入序号
			b.date = date;
		});
		//当前合约为scope建表
		//总投注记录+1
		// _bettings_append(bettings);
		bettings.emplace(_self, [&](auto &b) {
			b.b_id = bettings.available_primary_key();
			b.g_id = game.g_id;
			b.player_name = name;
			b.bet = game.betting_value;
			b.lucky_number = game.current_index; //暂时定为成玩家加入序号
			b.date = date;
		});

		if (game.current_index == game.max_player)
		{
			eosio::print("ready to open\n");
			inneropen(game.g_id);
		}
		else
		{
			eosio::print("palyer num not enough\n");
		}
	}
	///检测是否为我们的货币
	void check_my_asset(const asset &quantity, const asset &game_pay)
	{
		/*需不需要精度和符号都相等？此处仅仅符号相等 */
		eosio::print("quantity:", quantity.symbol, " game_pay:", game_pay.symbol,
					 "\n");
		eosio_assert(quantity.symbol == game_pay.symbol, "bad currency type!");
	}

	game_index games;
	betting_table_type bettings;
};

// EOSIO_ABI(lottery, (creategame)(join)(open)(removebetting)(stopgame)(transfer))
// https://eosio.stackexchange.com/q/421/54
#define EOSIO_ABI_EX(TYPE, MEMBERS)                                                                                              \
	extern "C"                                                                                                                   \
	{                                                                                                                            \
		void apply(uint64_t receiver, uint64_t code, uint64_t action)                                                            \
		{                                                                                                                        \
			if (action == N(onerror))                                                                                            \
			{                                                                                                                    \
				/* onerror is only valid if it is for the "eosio" code account and authorized by "eosio"'s "active permission */ \
				eosio_assert(code == N(eosio), "onerror action's are only valid from the \"eosio\" system account");             \
			}                                                                                                                    \
			auto self = receiver;                                                                                                \
			if (code == self || code == N(eosio.token) || action == N(onerror))                                                  \
			{                                                                                                                    \
				TYPE thiscontract(self);                                                                                         \
				switch (action)                                                                                                  \
				{                                                                                                                \
					EOSIO_API(TYPE, MEMBERS)                                                                                     \
				}                                                                                                                \
				/* does not allow destructor of thiscontract to run: eosio_exit(0); */                                           \
			}                                                                                                                    \
		}                                                                                                                        \
	}

EOSIO_ABI_EX(lottery, (creategame)(join)(open)(removebetting)(stopgame)(transfer))