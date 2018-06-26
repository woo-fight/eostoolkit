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
        : eosio::contract(self), games(_self, _self), bettings(_self, _self) {}

    void creategame(asset prize_pool, asset betting_value, uint16_t max_player);
    void join(account_name name, uint64_t g_id);
    void open(uint64_t g_id);
    void stopgame(uint64_t g_id);
    void removebetting(uint64_t g_id, uint64_t b_id);
    void transfer(uint64_t sender, uint64_t receiver);

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
        time date = now();    //开始游戏时间
        auto primary_key() const { return g_id; }

        EOSLIB_SERIALIZE(basegame, (g_id)(winner)(end));
    };

    ///@abi table lotterygame i64
    struct lotterygame : public basegame
    {
        uint16_t current_index; //当前参与玩家序号
        uint16_t max_player;    //本局玩家人数
        asset prize_pool;       //奖金池
        asset betting_value;    //每个投注金额固定
        EOSLIB_SERIALIZE(lotterygame, (g_id)(winner)(end)(date)(current_index)(
                                          max_player)(prize_pool)(betting_value));
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
        time date = now();        //投注时间
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
    betting_table_type bettings;

    /* ****************************************** */
    /* ------------ Private Functions ----------- */
    /* ****************************************** */
    void inneropen(uint64_t g_id);
    void innercreate(const asset &prize_pool, const asset &betting_value, uint16_t max_player);
    void game_rule(uint64_t g_id);
    void innerjoin(const account_name &name, const lotterygame &game);
    void check_my_asset(const asset &quantity, const asset &game_pay);
};