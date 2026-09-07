/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as BrevoPasswordReset from "../BrevoPasswordReset.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as authImpl from "../authImpl.js";
import type * as authUserLifecycle from "../authUserLifecycle.js";
import type * as camps from "../camps.js";
import type * as children from "../children.js";
import type * as classes from "../classes.js";
import type * as coaches from "../coaches.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as gallery from "../gallery.js";
import type * as galleryPublicManifest from "../galleryPublicManifest.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as newsletter from "../newsletter.js";
import type * as nocowanki from "../nocowanki.js";
import type * as parentDashboard from "../parentDashboard.js";
import type * as payments from "../payments.js";
import type * as registrationFormQuestions from "../registrationFormQuestions.js";
import type * as registrations from "../registrations.js";
import type * as seed from "../seed.js";
import type * as subscriptionCounts from "../subscriptionCounts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as trialSignups from "../trialSignups.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  BrevoPasswordReset: typeof BrevoPasswordReset;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  authImpl: typeof authImpl;
  authUserLifecycle: typeof authUserLifecycle;
  camps: typeof camps;
  children: typeof children;
  classes: typeof classes;
  coaches: typeof coaches;
  dashboard: typeof dashboard;
  events: typeof events;
  gallery: typeof gallery;
  galleryPublicManifest: typeof galleryPublicManifest;
  http: typeof http;
  locations: typeof locations;
  newsletter: typeof newsletter;
  nocowanki: typeof nocowanki;
  parentDashboard: typeof parentDashboard;
  payments: typeof payments;
  registrationFormQuestions: typeof registrationFormQuestions;
  registrations: typeof registrations;
  seed: typeof seed;
  subscriptionCounts: typeof subscriptionCounts;
  subscriptions: typeof subscriptions;
  trialSignups: typeof trialSignups;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
