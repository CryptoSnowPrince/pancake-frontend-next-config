import styled from 'styled-components'
import { Tag, Flex, Heading, Skeleton } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { FarmAuctionTag, CoreTag } from 'components/Tags'
import { TokenPairImage } from 'components/TokenImage'
import BoostedTag from '../YieldBooster/components/BoostedTag'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  isCommunityFarm?: boolean
  token: Token
  quoteToken: Token
  boosted?: boolean
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

const MultiplierTag = styled(Tag)`
  margin-left: 4px;
`

const CardHeading: React.FC<React.PropsWithChildren<ExpandableSectionProps>> = ({
  lpLabel,
  multiplier,
  isCommunityFarm,
  token,
  quoteToken,
  boosted,
}) => {
  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={quoteToken} width={64} height={64} />
      <Flex flexDirection="column" alignItems="flex-end">
        <Heading mb="4px">{lpLabel.split(' ')[0]}</Heading>
        <Flex justifyContent="center">
          {isCommunityFarm ? <FarmAuctionTag /> : <CoreTag />}
          {boosted && <BoostedTag ml="4px" />}
          {multiplier ? (
            <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
