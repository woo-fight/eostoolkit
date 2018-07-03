#include "lottery.hpp"

void lottery::creategame(asset prize_pool, asset betting_value, uint16_t max_player)
{
	require_auth(_self); //必须是我们自己
	_creategame(prize_pool, betting_value, max_player);
}

void lottery::join(account_name name, uint64_t g_id)
{
	require_auth(name);
	st_config cc = _get_config();
	eosio_assert(cc.lock != true, "the contract is locked");
	auto curr_game = games.find(g_id);
	eosio_assert(curr_game != games.end(), "the game dose not exist");
	eosio_assert(curr_game->end != true, "the recent game was over");
	eosio_assert(curr_game->current_index < curr_game->max_player &&
					 curr_game->current_index >= 0,
				 "reached the maximum number of player");
	action(permission_level{name, N(active)}, N(eosio.token), N(transfer),
		   std::make_tuple(name, _self, curr_game->betting_value,
						   std::string("bet")))
		.send();
	_join(name, *curr_game);
}

void lottery::open(uint64_t g_id)
{
	require_auth(_self);
	_open(g_id);
}

void lottery::stopgame(uint64_t g_id)
{
	require_auth(_self);
	auto itr = games.find(g_id);
	eosio_assert(itr != games.end(), "the game dose not exist");
	eosio_assert(itr->end != true, "the game was over");

	auto betting_index = bettings.get_index<N(bygid)>();
	auto game_bettings = betting_index.find(g_id);
	while (game_bettings != betting_index.end() &&
		   game_bettings->g_id == g_id)
	{

		eosio::print("cancel betting: ", game_bettings->b_id,
					 eosio::name{game_bettings->player_name});
		//还需要删除用户的数据(未测试)
		// auto betting_record_index = betting_table_type(_self, {game_bettings->player_name);
		// betting_record_index.erase(betting_record_index.find(game_bettings->b_id));
		// ++game_bettings;
		//返还用户金额
		action(permission_level{_self, N(active)}, N(eosio.token), N(transfer),
			   std::make_tuple(_self, game_bettings->player_name,
							   game_bettings->bet, string("")))
			.send();
		betting_index.erase(game_bettings++);
	}
	games.modify(itr, _self, [&](auto &g) { g.end = true; });
}

void lottery::removebetting(uint64_t g_id, uint64_t b_id)
{
	require_auth(_self);
	auto itr = games.find(g_id);
	eosio_assert(itr != games.end(), "the game dose not exist");
	eosio_assert(itr->end != true, "the recent game was over");
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
			action(permission_level{_self, N(active)}, N(eosio.token), N(transfer),
				   std::make_tuple(_self, betting->player_name,
								   betting->bet, string("")))
				.send();
			bettings.erase(betting);
			games.modify(itr, _self,
						 [&](auto &g) { g.current_index = g.current_index - 1; });

			//还需要删除用户的数据(未测试)
			// auto betting_record_index = betting_table_type(_self, {betting->player_name);
			// betting_record_index.erase(betting_record_index.find(game_bettings->b_id));
			break;
		}
		eosio::print("currently placed bet:", eosio::name{betting->player_name},
					 "betting id:", game_bettings->b_id);
		++game_bettings;
	}
}

void lottery::transfer(uint64_t sender, uint64_t receiver)
{
	print("\n>>> sender >>>", sender, " - name: ", name{sender});
	print("\n>>> receiver >>>", receiver, " - name: ", name{receiver});

	// ??? Don't need to verify because we already did it in EOSIO_ABI_EX ???
	// eosio_assert(code == N(eosio.token), "I reject your non-eosio.token deposit");
	st_config cc = _get_config();
	eosio_assert(cc.lock != true, "the contract is locked");
	auto transfer_data = unpack_action_data<st_transfer>();
	if (transfer_data.from == _self || transfer_data.to != _self)
	{
		return;
	}

	print("\n>>> transfer data quantity >>> ", transfer_data.quantity);

	// eosio_assert(transfer_data.quantity.symbol == string_to_symbol(4, "EOS"),
	// eosio_assert(transfer_data.quantity.symbol == string_to_symbol(4, "EOS"),
	// 			 "lottery only accepts EOS for deposits");
	eosio_assert(transfer_data.quantity.is_valid(), "Invalid token transfer");
	eosio_assert(transfer_data.quantity.amount > 0, "Quantity must be positive");
	if (transfer_data.quantity.symbol == string_to_symbol(4, "EOS"))
	{
		auto curr_game = games.rbegin();
		eosio_assert(curr_game->end != true, "the recent game was over");
		auto max = transfer_data.quantity / curr_game->betting_value;
		print("\n>>> max bet number:>>>", max);
		print("\n>>> transfer_data.quantity.amount >>>", transfer_data.quantity.amount, " - curr_game->betting_value.amount: ", curr_game->betting_value.amount);
		print("\n>>> curr game_idx >>>", curr_game->g_id, " - name: ", name{sender});
		for (uint32_t i = 0; i < max; i++)
		{
			_join(sender, *curr_game);
		}
	}
	print("\n", name{transfer_data.from}, " receive fouds:       ", transfer_data.quantity);
	// print("\n", name{transfer_data.from}, " funds available: ", new_balance);
}
void lottery::lock()
{
	require_auth(_self);
	st_config cc = _get_config();
	cc.lock = true;
	contract_cfg.set(cc, _self);
}
void lottery::unlock()
{
	require_auth(_self);
	st_config cc = _get_config();
	cc.lock = false;
	contract_cfg.set(cc, _self);
}
void lottery::distorytable()
{
	require_auth(_self);
	/* 删除 table lottergame */
	auto itr_game = games.begin();
	while (itr_game != games.end())
	{
		games.erase(itr_game++);
	}
	auto itr_betting = bettings.begin();
	while (itr_betting != bettings.end())
	{
		bettings.erase(itr_betting++);
	}
}
void lottery::_open(uint64_t g_id)
{
	eosio::print("************* _open", "\n");
	auto itr = games.find(g_id);
	eosio_assert(itr != games.end(), "the game dose not exist");
	eosio_assert(itr->current_index == itr->max_player,
				 "wrong number of players cannot start the game");
	_game_rule(g_id);
}
/** 创建一局游戏,指定本局游戏筹码数量
	* @abi action
	*/
void lottery::_creategame(const asset &prize_pool, const asset &betting_value,
						  uint16_t max_player)
{
	// eosio_assert(max_player < 100 && max_player >= 0,
	//"number of players  beyond the limit(100)");
	eosio_assert(prize_pool.is_valid(), "Invalid prize_pool");
	eosio_assert(prize_pool.amount > 0, "prize_pool must be positive");
	eosio_assert(betting_value.is_valid(), "Invalid betting_value");
	eosio_assert(betting_value.amount > 0, "betting_value must be positive");
	eosio_assert(max_player > 0, "max_player must be positive");
	eosio_assert(prize_pool.symbol == string_to_symbol(4, "EOS"), "prize_pool err,  only core token allowed");
	eosio_assert(betting_value.symbol == string_to_symbol(4, "EOS"), "betting_value err,  only core token allowed");
	eosio::print("_creategame: prize_pool amount:", prize_pool.amount,
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
void lottery::_game_rule(uint64_t g_id)
{
	auto game = games.find(g_id);
	eosio_assert(game != games.end(), "the game dose not exist");
	auto betting_index = bettings.get_index<N(bygid)>();
	auto curr_game_bettings = betting_index.find(g_id);
	eosio::print("************** _game_rule", "\n");
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
	/* 当前时间戳的 hash 部分 与 该局游戏最后买家的名称哈希 组成开奖种子 */
	auto last_betting = bettings.rbegin();
	auto prize_number = ((lucky_key.hash[0] + lucky_key.hash[10] + lucky_key.hash[16] + last_betting->player_name) % game->max_player) + 1;
	eosio::print(">>>lucky seed>>>", " - lucky_key.hash[0]: ", (uint32_t)lucky_key.hash[0],
				 " - lucky_key.hash[10]: ", (uint32_t)lucky_key.hash[10], " - lucky_key.hash[16]: ", (uint32_t)lucky_key.hash[16],
				 " - last player_name: ", last_betting->player_name, name{last_betting->player_name}, "\n");
	eosio::print("the lucky number*******:", prize_number, "\n");
	account_name winner;
	while (curr_game_bettings != betting_index.end() &&
		   curr_game_bettings->g_id == g_id)
	{
		auto lucky_betting = bettings.find(curr_game_bettings->b_id);

		if (lucky_betting->lucky_number == prize_number)
		{
			winner = lucky_betting->player_name;
			eosio::print("the winner:", eosio::name{winner},
						 "the winning betting id:", lucky_betting->b_id, "\n");
			//发奖励
			action(permission_level{_self, N(active)}, N(eosio.token), N(transfer),
				   std::make_tuple(_self, winner, game->prize_pool,
								   std::string("恭喜您中奖啦！")))
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
		g.prize_number = prize_number;
		g.end = true;
	});

	/* 如果当前期数比最小期数小于 MAX_PERIOD，则删除最小期数的数据 */
	if ((g_id - games.begin()->g_id) >= MAX_PERIOD)
	{
		_distorygame(games.begin()->g_id);
	}

	// 开始新一轮的游戏
	_creategame(game->prize_pool, game->betting_value, game->max_player);
	// creategame(eosio::chain::asset::from_string("100.0000" " "
	// CORE_SYMBOL_NAME), 100);
}

void lottery::_join(const account_name &name, const lotterygame &game)
{
	auto betting_index = bettings.get_index<N(bygid)>();
	auto curr_game_bettings = betting_index.find(game.g_id);
	// 当前玩家数加1
	games.modify(game, _self,
				 [&](auto &g) { g.current_index = g.current_index + 1; });

	// time date = now();
	//具体玩家为scope建表，这里要关注 ram 的使用情况，应该使用的合约开发者的 ram
	// 当前玩家投注数据记录
	// 节省 ram 暂时不要
	// auto betting_record_index = betting_table_type(_self, name);
	// betting_record_index.emplace(_self, [&](auto &b) {
	// 	b.b_id = betting_record_index.available_primary_key();
	// 	b.g_id = game.g_id;
	// 	b.player_name = name;
	// 	b.bet = game.betting_value;
	// 	b.lucky_number = game.current_index; //暂时定为成玩家加入序号
	// 	b.date = date;
	// });
	//当前合约为scope建表
	//总投注记录+1
	bettings.emplace(_self, [&](auto &b) {
		b.b_id = bettings.available_primary_key();
		b.g_id = game.g_id;
		b.player_name = name;
		b.bet = game.betting_value;
		b.lucky_number = game.current_index; //暂时定为成玩家加入序号
											 // b.date = date;
	});

	if (game.current_index == game.max_player)
	{
		eosio::print("ready to open\n");
		_open(game.g_id);
	}
	else
	{
		eosio::print("palyer num not enough\n");
	}
}
void lottery::_distorygame(uint64_t g_id)
{
	auto itr = games.find(g_id);
	eosio_assert(itr != games.end(), "the game dose not exist");

	auto betting_index = bettings.get_index<N(bygid)>();
	auto game_bettings = betting_index.find(g_id);
	/* 删除当前投票数据 */
	while (game_bettings != betting_index.end() &&
		   game_bettings->g_id == g_id)
	{
		betting_index.erase(game_bettings++);
	}
	/* 删除当前游戏数据 */
	games.erase(itr);
}

lottery::st_config lottery::_get_config()
{
	st_config cc;

	if (contract_cfg.exists())
	{
		cc = contract_cfg.get();
	}
	else
	{
		cc = st_config{};
		contract_cfg.set(cc, _self);
	}

	return cc;
}
// EOSIO_ABI(lottery, (creategame)(join)(open)(removebetting)(stopgame)(transfer)(lock)(unlock))
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

EOSIO_ABI_EX(lottery, (creategame)(join)(open)(removebetting)(stopgame)(transfer)(lock)(unlock)(distorytable))