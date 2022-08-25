import { createSelector } from 'reselect'

import { selectIsTasksLoading } from '../Courier/taskSelectors'

export const selectUser = state => state.app.user
export const selectHttpClient = state => state.app.httpClient

export const selectIsAuthenticated = createSelector(
  selectUser,
  (user) => !!(user && user.isAuthenticated())
)

export const selectHttpClientHasCredentials = createSelector(
  selectHttpClient,
  (httpClient) => !!(httpClient && !!httpClient.getToken())
)

export const selectIsLoading = createSelector(
  state => state.app.loading,
  selectIsTasksLoading,
  state => state.dispatch.isFetching,
  state => state.restaurant.isFetching,
  state => state.checkout.isFetching,
  (isAppLoading, isTasksLoading, isDispatchLoading, isRestaurantLoading, isCheckoutLoading) => {

    return isAppLoading
      || isTasksLoading
      || isDispatchLoading
      || isRestaurantLoading
      || isCheckoutLoading
      || false
  }
)
