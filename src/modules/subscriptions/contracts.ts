// Public contracts. Provider IDs and payloads stay exclusively in server modules.
export type { SubscriptionView, SubscriptionState } from './status'
export type CheckoutAvailability = { status: 'unavailable' | 'ready' | 'ineligible'; reason: 'test_configuration_missing' | 'test_mode' | 'trial_already_used'; subscription?: import('./status').SubscriptionView }
export type PortalRequest = { action: 'manage' | 'payment_method' | 'payments' | 'regularize' }
export type CancellationRequest = { confirm: true; expectedEnd: string }
