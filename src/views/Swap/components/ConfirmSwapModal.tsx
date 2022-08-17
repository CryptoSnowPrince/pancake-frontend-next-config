import { useCallback, useMemo } from 'react'
import { Currency, Trade, TradeType } from '@pancakeswap/sdk'
import { InjectedModalProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(
  tradeA: Trade<Currency, Currency, TradeType>,
  tradeB: Trade<Currency, Currency, TradeType>,
): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}
interface ConfirmSwapModalProps {
  trade?: Trade<Currency, Currency, TradeType>
  originalTrade?: Trade<Currency, Currency, TradeType>
  attemptingTxn: boolean
  txHash?: string
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage?: string
  customOnDismiss?: () => void
}

const ConfirmSwapModal: React.FC<React.PropsWithChildren<InjectedModalProps & ConfirmSwapModalProps>> = ({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  customOnDismiss,
  recipient,
  swapErrorMessage,
  attemptingTxn,
  txHash,
}) => {
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade],
  )

  const { t } = useTranslation()

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    ) : null
  }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade])

  // text to show while loading
  const pendingText = t('Swapping %amountA% %symbolA% for %amountB% %symbolB%', {
    amountA: trade?.inputAmount?.toSignificant(6) ?? '',
    symbolA: trade?.inputAmount?.currency?.symbol ?? '',
    amountB: trade?.outputAmount?.toSignificant(6) ?? '',
    symbolB: trade?.outputAmount?.currency?.symbol ?? '',
  })

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage],
  )

  return (
    <TransactionConfirmationModal
      title={t('Confirm Swap')}
      onDismiss={onDismiss}
      customOnDismiss={customOnDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  )
}

export default ConfirmSwapModal
