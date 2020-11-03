const axios = require('axios')
const cliLogger = require('cli-logger')
const delay = require('delay')
const fs = require('fs')
const path = require('path')
const querystring = require('querystring')
const { API_URLS, EXPLORER_URLS, RequestStatus, VerificationStatus } = require('./constants')

const contractPath = "../../../mars/mint-protocol/build/contracts/"
const PriceOracle = require(contractPath+'PriceOracle')
const LendingPoolAddressesProvider = require(contractPath+'LendingPoolAddressesProvider')
const LendingPool = require(contractPath+'LendingPool')
const LendingPoolCore = require(contractPath+'LendingPoolCore')
const LendingPoolConfigurator = require(contractPath+'LendingPoolConfigurator')

const DefaultReserveInterestRateStrategy = require(contractPath+"DefaultReserveInterestRateStrategy")

const CoreLibrary = require(contractPath+"CoreLibrary")
// proxy 没有地址
const InitializableAdminUpgradeabilityProxy = require("./contracts/InitializableAdminUpgradeabilityProxy")
// const InitializableUpgradeabilityProxy = require(contractPath+"InitializableUpgradeabilityProxy")
//


const {etherscanKey} = require('../../../mars/secrets_mint_admin.json');
let oo = {
  networkId: 4,
  apiKey: etherscanKey,
  apiUrl: 'https://api-rinkeby.etherscan.io/api'
}

const fetchConstructorValues = async (artifact, options) => {
  const contractAddress = artifact.networks[`${options.networkId}`].address

  // Fetch the contract creation transaction to extract the input data
  let res
  try {
    const qs = querystring.stringify({
      apikey: options.apiKey,
      module: 'account',
      action: 'txlist',
      address: contractAddress,
      page: 1,
      sort: 'asc',
      offset: 1
    })
    const url = `${options.apiUrl}?${qs}`
    console.debug(`Retrieving constructor parameters from ${url}`)
    res = await axios.get(url)
  } catch (e) {
    throw new Error(`Failed to connect to Etherscan API at url ${options.apiUrl}`)
  }

  // The last part of the transaction data is the constructor arguments
  // If it can't be accessed for any reason, try using empty constructor arguments
  if (res.data && res.data.status === RequestStatus.OK && res.data.result[0] !== undefined) {
    const constructorArgs = res.data.result[0].input.substring(artifact.bytecode.length)
    console.debug(`Constructor parameters retrieved: 0x${constructorArgs}`)
    return constructorArgs
  } else {
    console.debug('Could not retrieve constructor parameters, using empty parameters as fallback')
    return ''
  }
}

const fetchInputJSON = async (artifact, options) => {
  const metadata = JSON.parse(artifact.metadata)

  const inputJSON = {
    language: metadata.language,
    sources: metadata.sources,
    settings: {
      remappings: metadata.settings.remappings,
      optimizer: metadata.settings.optimizer,
      evmVersion: metadata.settings.evmVersion,
      libraries: { '': artifact.networks[`${options.networkId}`].links || {} }
    }
  }

  for (const contractPath in inputJSON.sources) {
    const absolutePath = require.resolve(contractPath)
    const content = fs.readFileSync(absolutePath, 'utf8')
    inputJSON.sources[contractPath] = { content }
  }

  return inputJSON
}

const sendVerifyRequest = async (artifact, options) => {
  const encodedConstructorArgs = await fetchConstructorValues(artifact, options)
  const inputJSON = await fetchInputJSON(artifact, options)

  const postQueries = {
    apikey: options.apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: artifact.networks[`${options.networkId}`].address,
    sourceCode: JSON.stringify(inputJSON),
    codeformat: 'solidity-standard-json-input',
    contractname: `${artifact.sourcePath}:${artifact.contractName}`,
    compilerversion: `v${artifact.compiler.version.replace('.Emscripten.clang', '')}`,
    constructorArguements: encodedConstructorArgs
  }

  try {
    console.debug('Sending verify request with POST arguments:')
    console.debug(JSON.stringify(postQueries, null, 2))
    return await axios.post(options.apiUrl, querystring.stringify(postQueries))
  } catch (e) {
    throw new Error(`Failed to connect to Etherscan API at url ${options.apiUrl}`)
  }
}

(async () => {

  // let foo = await sendVerifyRequest(InitializableAdminUpgradeabilityProxy, oo)
  console.log(foo)
})()

