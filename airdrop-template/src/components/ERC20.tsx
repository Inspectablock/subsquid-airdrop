"use client";

import { useState } from "react";
import { BaseError } from "viem";
import {
  Address,
  useAccount,
  useNetwork,
  useWaitForTransaction,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";

import { ApolloProvider } from "react-apollo";
import {
  ApolloClient,
  InMemoryCache,
  useQuery,
  gql
} from "@apollo/client";
import {
  useErc20Allowance,
  useErc20Approve,
  useErc20BalanceOf,
  useErc20Name,
  useErc20Symbol,
  useErc20TotalSupply,
  useErc20Transfer,
  usePrepareErc20Approve,
  usePrepareErc20Transfer,
} from "../generated";
import { airdropAbi } from "./abi";

const MULTIPLIER = 1000000000000000000;
const client = new ApolloClient({
  uri: "https://squid.subsquid.io/evm-tutorial-ib/v/v1/graphql",
  cache: new InMemoryCache()
})
const GET_USERS_QUERY = gql`
  query getUsers {
    addresses{
      id
    }
  }
`;
export function ERC20() {
  
  const {address} = useAccount();
  const [tokenAddress, setTokenAddress] = useState<Address>(
    `0x${""}`
  );

  const [airdropAddress, setAirdropAddress] = useState<Address>(
    `0x${""}`
  );

  return (
  
      <div className="block items-center pt-2">
        <div>
          <label className="text-[#0A2540]">Airdrop Address: </label>
          <input
           className="ml-[30px] appearance-none mx-5 w-120 bg-white text-gray-700  py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white rounded-full"
            onChange={(e) => setAirdropAddress(e.target.value as Address)}
            value={airdropAddress}
            style={{ width: 400 }}

          />
        </div>
        <div>
          <label className="text-[#0A2540]">Token Address: </label>
          <input
            className="ml-[30px] appearance-none mx-5 w-120 bg-white text-gray-700  py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white rounded-full"
            onChange={(e) => setTokenAddress(e.target.value as Address)}
            value={tokenAddress}
            style={{ width: 400 }}
           
          />
        </div>
        <>
          <h3></h3>
          <div className="stats my-5 bg-[#635AFF]">
            <div className="stat place-items-center">
              <div className="stat-title text-gray-200">Name</div>
            
              <Name tokenAddress={tokenAddress} />
              <div className="stat-desc"></div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title text-gray-200">Balance</div>
              <BalanceOf address={address} tokenAddress={tokenAddress} />
              <div className="stat-desc text-secondary"></div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title text-gray-200">Total Supply</div>
              <TotalSupply tokenAddress={tokenAddress} />
             
              <div className="stat-desc"></div>
            </div>
          </div>

         
          <h3></h3>
           <Allowance address={address} contractAddress={airdropAddress} tokenAddress={tokenAddress}/>

           {/* Airdrop Component Here */}

          
        </>
      </div>
    
  );
}

function Name({ tokenAddress }: { tokenAddress: Address }) {
  
  return (
    <div className="text-white">
      Test Token ($TEST)
    </div>
  );
}
function TotalSupply({ tokenAddress }: { tokenAddress: Address }) {
  const {data : totalSupply} = useErc20TotalSupply({
    address: tokenAddress
  });
  let totalSupplyDecimal = 0;
  if (totalSupply) {
    totalSupplyDecimal = Number(totalSupply) / MULTIPLIER;
  }
  return <div className="text-white">{totalSupplyDecimal?.toString()} units</div>;
}

function BalanceOf({
  address,
  tokenAddress,
}: {
  address?: Address;
  tokenAddress: Address;
}) {
  const {data : balance} = useErc20BalanceOf({
    address: tokenAddress,
    args: address ? [address] : undefined,
    watch: true,
  });
  let balanceDecimal = 0;
  if (balance) {
    balanceDecimal = Number(balance) / MULTIPLIER;
  }
  return <div className="text-white">{balanceDecimal?.toString()} units</div>;
}

function Airdrop({
  address, //airdrop
  tokenAddress, //token address
  profileAddress,
}: {
  address?: Address;
  tokenAddress: Address;
  profileAddress?: Address;
}) {
 


  return (
    <div>
      

      <button
        className="btn rounded-full bg-[#635AFF] border-[#635AFF] text-white mr-2 my-2 btn-xs sm:btn-sm md:btn-md lg:btn-md"
       
      >
        Get Addresses
      </button>
      
      <button
        className="btn rounded-full mr-2 border-[#635AFF] bg-[#635AFF] text-white  my-2 btn-xs sm:btn-sm md:btn-md lg:btn-md"
        
       
      >
        Airdrop
      </button>
    </div>
  );
}

function Allowance({
  address,
  contractAddress,
  tokenAddress,
}: {
  address?: Address;
  contractAddress: Address;
  tokenAddress: Address;
}) {
  
  const [amount, setAmount] = useState("");
  const [spender, setSpender] = useState(contractAddress);

  const {config, error, isError} = usePrepareErc20Approve({
    address: tokenAddress,
    args: spender && amount ? [spender, BigInt(Number(amount) * MULTIPLIER)] : undefined,
    enabled: Boolean(spender && amount),
  })
  const {data, write} = useErc20Approve(config)
  const {isLoading, isSuccess} = useWaitForTransaction({
    hash: data?.hash
  })

  const {data: balance} = useErc20Allowance({
    address: tokenAddress,
    args: address && spender ? [address, contractAddress] : undefined,
    watch: true
  })

  let allowance = 0;
  if (balance) {
    allowance = Number(balance) / MULTIPLIER
  }

  return (
    <div>
      
      <div className="text-[#0A2540]">
        Airdrop Allowance:{" "}
        <input
          disabled={isLoading}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="amount (units)"
          value={amount}
          className="appearance-none mx-5 w-60 bg-white text-gray-700  py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white rounded-full"
        />
        <button
          disabled={isLoading && !write}
          onClick={() => write?.()}
          className="btn text-white rounded-full bg-[#635AFF] border-[#635AFF] mr-2 my-2 btn-xs sm:btn-sm md:btn-md lg:btn-md"
         
        >
          set
        </button>
        
        {isLoading && <ProcessingMessage hash={data?.hash} />}
        {isSuccess && <div>Success !</div>}
        {isError && <div>Error: {(error as BaseError)?.shortMessage}</div>}
       
      </div>
      <div className="text-[#0A2540]">Allowance: {allowance?.toString()}</div>
    </div>
  );
}



function ProcessingMessage({ hash }: { hash?: `0x${string}` }) {
  const { chain } = useNetwork();
  const etherscan = chain?.blockExplorers?.etherscan;
  return (
    <span>
      Processing transaction...{" "}
      {etherscan && (
        <a href={`${etherscan.url}/tx/${hash}`}>{etherscan.name}</a>
      )}
    </span>
  );
}
