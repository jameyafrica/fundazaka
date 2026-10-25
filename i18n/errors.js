// Turns the English error messages produced by the pure helpers (utils/money.js, utils/budgetActions.js,
// utils/transactions.js) into the chosen language. An unknown message is shown as it is, so nothing is lost.
import { AMOUNT_FORMAT_ERROR, AMOUNT_TOO_BIG_ERROR, AMOUNT_ZERO_ERROR } from '../utils/money';

const ERROR_KEYS = {
  [AMOUNT_FORMAT_ERROR]: 'err.amountFormat',
  [AMOUNT_TOO_BIG_ERROR]: 'err.amountTooBig',
  [AMOUNT_ZERO_ERROR]: 'err.amountZero',
  'Please choose Work, Gift or Other.': 'err.chooseSource',
  'Please choose one of your expenses.': 'err.chooseExpense',
  'That entry no longer exists.': 'err.entryGone',
};

// t: translate function from useT().
export function localizeError(t, message) {
  const key = ERROR_KEYS[message];
  return key ? t(key) : message;
}
