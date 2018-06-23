const config = {
    contract_account: 'frank1111111',
    bbb: 222,
    customNetwork: {
        blockchain: 'eos',
        host: '10.0.2.97',  // ( or null if endorsed chainId )
        port: 8888,                    // ( or null if defaulting to 80 )
        chainId:
            'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'  // Or null to fetch automatically ( takes longer )
    },
    environment: {
        production: false,
        apiUrl: '//10.0.2.97:8888',
        eosHost: '10.0.2.97',
        eosPort: 8888,
        eosProtocol: 'http',
    }
}
export default config;