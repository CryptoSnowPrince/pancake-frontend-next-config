import { useWeb3React } from '@pancakeswap/wagmi'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useRouter, NextRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { isChainSupported } from 'utils/wagmi'
import { useProvider } from 'wagmi'
import { useActiveChainId, useLocalNetworkChain } from './useActiveChainId'

const getHashFromRouter = (router: NextRouter) => {
  return router.asPath.match(/#([a-z0-9]+)/gi)
}

export function useNetworkConnectorUpdater() {
  const localChainId = useLocalNetworkChain()
  const { chain, isConnecting } = useActiveWeb3React()
  const { switchNetwork, isLoading, pendingChainId } = useSwitchNetwork()
  const router = useRouter()
  const chainId = chain?.id || localChainId
  const [triedSwitchFromQuery, setTriedSwitchFromQuery] = useState(false)

  useEffect(() => {
    if (isLoading || !router.isReady || isConnecting) return
    const parsedQueryChainId = Number(router.query.chainId)
    if (triedSwitchFromQuery) {
      if (parsedQueryChainId !== chainId && isChainSupported(chainId)) {
        const uriHash = getHashFromRouter(router)?.[0]
        router.replace(
          {
            query: {
              ...router.query,
              chainId,
            },
            ...(uriHash && { hash: uriHash }),
          },
          undefined,
        )
      }
    } else if (isChainSupported(parsedQueryChainId)) {
      switchNetwork(parsedQueryChainId)
        .then((r) => {
          console.info('Auto switch network', r)
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => setTriedSwitchFromQuery(true))
    } else {
      setTriedSwitchFromQuery(true)
    }
  }, [chainId, isConnecting, isLoading, router, switchNetwork, triedSwitchFromQuery])

  return {
    isLoading,
    switchNetwork,
    pendingChainId,
  }
}

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useActiveWeb3React = () => {
  const web3React = useWeb3React()
  const chainId = useActiveChainId()
  const provider = useProvider({ chainId })

  return {
    provider,
    ...web3React,
    chainId,
  }
}

export default useActiveWeb3React
