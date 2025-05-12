// import { z } from 'zod';

// const currencySchema = z.object({
//   ID: z.number().optional(),
//   currency: z.string(),
//   currencySymbol: z.string(),
//   currencyPosition: z.string(),
//   currencyCodePosition: z.string(),
//   thousandSeparator: z.string(),
//   decimalSeparator: z.string(),
//   numberDecimal: z.coerce.number(), // Coerce from string to number
//   rate: z.object({
//     type: z.string(),
//     value: z.coerce.number(),
//   }),
//   fee: z.object({
//     type: z.string(),
//     value: z.coerce.number(),
//   }),
//   default: z.boolean(),
//   status: z.coerce.number(),
//   paymentMethods: z.array(z.string()), //['bacs', 'cheque', 'cod']
//   countries: z.array(z.string()), // countries ['default']
//   roundingType: z.string(),
//   roundingValue: z.coerce.number(),
//   subtractAmount: z.coerce.number(),
// });

// const manageCurrencySchema = z.array(currencySchema);

// const forcePaymentCurrencySchema = z.object({
//   force_enable: z.coerce.number(),
//   force_payment: z.string(),
//   force_notice: z.string(),
//   force_notice_text: z.string(),
//   reload_page: z.coerce.number(),
// });

// const forceCurrencyPaymentMethodSchema = z.object({
//   force_currency_enable: z.coerce.number(),
//   force_currency_reload_page: z.coerce.number(),
//   force_currency_payment_options: z.array(
//     z.object({
//       id: z.string(),
//       title: z.string(),
//       currency: z.string(),
//     }),
//   ),
// });

// const checkoutOptionsSchema = z.object({
//   isCheckoutDifferentCurrency: z.coerce.number(),
//   checkoutFallbackCurrency: z.string(),
//   forcePaymentCurrency: forcePaymentCurrencySchema,
//   forceCurrencyPaymentMethod: forceCurrencyPaymentMethodSchema,
// });

// const displayOptionsSchema = z.object({
//   isShowOnSingleProductPage: z.coerce.number(),
//   switcherPositionOnSingleProductPage: z.string(),
//   isShowFlagInSwitcher: z.coerce.number(),
//   isShowCurrencyNameInSwitcher: z.coerce.number(),
//   isShowCurrencySymbolInSwitcher: z.coerce.number(),
//   isShowCurrencyCodeInSwitcher: z.coerce.number(),
//   switcherSize: z.string(),
//   currencyUnitType: z.string(),
// });

// const advancedOptionsSchema = z.object({
//   isSetFixedPrice: z.coerce.number(),
//   isUpdateExchangeRateAuto: z.coerce.number(),
//   timeUpdateExchangeRateAuto: z.object({
//     value: z.string(),
//     type: z.string(),
//   }),
//   financeApi: z.string(),
//   isAutoSelectCurrencyByCountries: z.coerce.number(),
//   isGoogleCrawlersOrBotsEnable: z.coerce.number(),
//   isWPMLCompatible: z.coerce.number(),
//   isPolylangCompatible: z.coerce.number(),
//   showNotice: z.coerce.number(),
//   noticeText: z.string(),
//   approximatePrice: z.object({
//     status: z.coerce.number(),
//     label: z.string(),
//     position: z.string(),
//     show_on: z.array(z.string()),
//   }),
//   forceCacheCompatible: z.object({
//     cache_enable: z.coerce.number(),
//     cache_loading_enable: z.coerce.number(),
//   }),
// });

// export const settingsFormSchema = z.object({
//   manage_currency: manageCurrencySchema,
//   checkout_options: checkoutOptionsSchema,
//   display_options: displayOptionsSchema,
//   advance_settings: advancedOptionsSchema,
// });

// export type SettingsFormData = z.infer;

// export type CurrencySchema = z.infer;

// export type ManageCurrencySettings = z.infer;

// export type CheckoutSettings = z.infer;

// export type DisplaySettings = z.infer;

// export type AdvancedSettings = z.infer;
