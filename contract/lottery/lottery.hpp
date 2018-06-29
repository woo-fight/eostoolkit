#include <eosiolib/asset.hpp>
#include <eosiolib/contract.hpp>
#include <eosiolib/crypto.h>
#include <eosiolib/currency.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/multi_index.hpp>
#include <eosiolib/singleton.hpp>
#include <iostream>
#include <string>
#include <time.h>
#include <utility>
#include <vector>
using namespace eosio;
using std::string;

/* ****************************************** */
/* ------------ Types Declarations ---------- */
/* ****************************************** */

/* ****************************************** */
/* ------------ Contract Definition --------- */
/* ****************************************** */

class lottery : public eosio::contract
{

  public:
    using contract::contract;
    lottery(account_name self)
        : eosio::contract(self), games(_self, _self),
          bettings(_self, _self), contract_cfg(_self, _self) {}
    /** 创建一局游戏,指定本局游戏筹码数量
	* @abi action
	*/
    void creategame(asset prize_pool, asset betting_value, uint16_t max_player);
    /** 玩家加入游戏
	* quantity 一次投注多少
	* id 表示加入哪局游戏
	* @abi action
	*/
    void join(account_name name, uint64_t g_id);
    /** 开奖
	** @abi action
	*/
    void open(uint64_t g_id);
    /**
	* 游戏一直未满，管理员主动结束，返回资金给竞猜者
	* @abi action
	*/
    void stopgame(uint64_t g_id);
    /**支付失败的情况下从改局游戏中移除,这种情况不会存在
	* @abi action
	*/
    void removebetting(uint64_t g_id, uint64_t b_id);
    /**转账
	* @abi action
	*/
    void transfer(uint64_t sender, uint64_t receiver);
    /**锁定
	* @abi action
	*/
    void lock();
    /**解锁
	* @abi action
	*/
    void unlock();
    /**删除 table 数据
	* @abi action
	*/
    void distorytable();

  private:
    struct st_transfer
    {
        account_name from;
        account_name to;
        asset quantity;
        string memo;
    };

    /* ****************************************** */
    /* ------------ Contract Tables ------------- */
    /* ****************************************** */

    struct basegame
    {
        uint64_t g_id;
        account_name winner;
        uint16_t end = false; //是否已经开奖
        // time date = now();    //开始游戏时间
        auto primary_key() const { return g_id; }

        EOSLIB_SERIALIZE(basegame, (g_id)(winner)(end));
    };

    ///@abi table lotterygame i64
    struct lotterygame : public basegame
    {
        uint16_t current_index;    //当前参与玩家序号
        uint16_t max_player;       //本局玩家人数
        asset prize_pool;          //奖金池
        asset betting_value;       //每个投注金额固定
        uint64_t prize_number = 0; //中奖号码
        EOSLIB_SERIALIZE(lotterygame, (g_id)(winner)(end)(current_index)(max_player)(prize_pool)(betting_value)(prize_number));
    };

    typedef eosio::multi_index<N(lotterygame), lotterygame> game_index;

    game_index games;

    ///@abi table betting i64
    struct betting
    {
        uint64_t b_id;            //主键序号
        uint64_t g_id;            //游戏 id
        account_name player_name; //玩家账户
        asset bet;                //投注额度
        uint64_t lucky_number;    //投注号码
        // time date = now();        //投注时间
        auto primary_key() const { return b_id; }
        uint64_t game_id() const { return g_id; }
        // account_name player_name() const { return player_name; }
        EOSLIB_SERIALIZE(betting, (b_id)(g_id)(player_name)(bet)(lucky_number));
    };

    typedef eosio::multi_index<N(betting), betting, indexed_by<N(bygid), const_mem_fun<betting, uint64_t, &betting::game_id>>> betting_table_type;
    betting_table_type bettings;

    /* ****************************************** */
    /* ------------ Contract Config Data -------- */
    /* ****************************************** */

    ///@abi table config i64
    struct st_config
    {
        uint64_t lock = false; // 合约锁
    };
    typedef singleton<N(config), st_config> cfg_singleton;

    cfg_singleton contract_cfg;
    /* ****************************************** */
    /* ------------ Private Functions ----------- */
    /* ****************************************** */
    void _open(uint64_t g_id);
    void _creategame(const asset &prize_pool, const asset &betting_value, uint16_t max_player);
    void _game_rule(uint64_t g_id);
    void _join(const account_name &name, const lotterygame &game);
    st_config _get_config();
};