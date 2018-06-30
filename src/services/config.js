const config = {
  contract_account: 'test12345123',
  customNetwork: {
    blockchain: 'eos',
    host: 'jungle.cryptolions.io',  // ( or null if endorsed chainId )
    port: 18888,         // ( or null if defaulting to 80 )
    chainId:
      '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca',  // Or null to fetch automatically ( takes longer )
    protocol: 'http'
  },
  // environment: {
  //   production: false,
  //   apiUrl: '//jungle.cryptolions.io:18888',
  //   eosHost: 'jungle.cryptolions.io',
  //   eosPort: 18888,
  //   eosProtocol: 'http',
  // },
  token_symnol: 'EOS'
}

export default config;