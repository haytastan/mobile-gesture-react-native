import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'

import i18n from '../../../i18n'
import { selectIsAuthenticated } from '../../App/selectors'

import tracker from '../../../analytics/Tracker'
import analyticsEvent from '../../../analytics/Event'

const BackgroundGeolocationEvents = [
  'start',
  'stop',
  'location',
  'error',
  'authorization',
]

export default ({ getState, dispatch }) => {

  const options = {
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: 5,
    distanceFilter: 10,
    debug: process.env.NODE_ENV === 'development',
    startOnBoot: false,
    startForeground: true,
    notificationTitle: i18n.t('BACKGROUND_GEOLOCATION_NOTIFICATION_TITLE'),
    notificationText: i18n.t('BACKGROUND_GEOLOCATION_NOTIFICATION_TEXT'),
    stopOnTerminate: true,
    stopOnStillActivity: false,
    locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
    interval: 3000,
    fastestInterval: 1000,
    activitiesInterval: 5000,
    // option.maxLocations has to be larger than option.syncThreshold.
    // It's recommended to be 2x larger.
    // In any other case the location syncing might not work properly.
    maxLocations: 10,
    syncThreshold: 5,
  }

  BackgroundGeolocation.configure(options)

  return (next) => (action) => {

    const prevState = getState()
    const result = next(action)
    const state = getState()

    const hasUserChanged = state.app.user !== prevState.app.user

    if (!hasUserChanged) {
      return result
    }

    if (selectIsAuthenticated(state) && state.app.user && state.app.user.hasRole('ROLE_COURIER')) {

      BackgroundGeolocation.configure({
        url: `${state.app.baseURL}/api/me/location`,
        syncUrl: `${state.app.baseURL}/api/me/location`,
        httpHeaders: {
          'Authorization': `Bearer ${state.app.user.token}`,
          'Content-Type': 'application/ld+json',
        },
        postTemplate: {
          latitude: '@latitude',
          longitude: '@longitude',
          time: '@time',
        },
      })

      // This is called when server responded with "401 Unauthorized"
      BackgroundGeolocation.removeAllListeners('http_authorization')
      BackgroundGeolocation.on('http_authorization', () => {

        tracker.logEvent(
          analyticsEvent.system.backgroundGeolocation._category,
          analyticsEvent.system.backgroundGeolocation.httpAuthorization
        )

        state.app.httpClient.refreshToken()
          .then(token => {
            tracker.logEvent(
              analyticsEvent.system.backgroundGeolocation._category,
              analyticsEvent.system.backgroundGeolocation.configure
            )
            BackgroundGeolocation.configure({
              httpHeaders: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/ld+json',
              },
            })
          })
          .catch(e => {
            // If the token could not be refreshed,
            // we mark the locations as deleted to stop retrying
            BackgroundGeolocation.deleteAllLocations()
          })
      })

      BackgroundGeolocation.start()

    } else {
      BackgroundGeolocation.configure({
        url: null,
        syncUrl: null,
        httpHeaders: {},
        postTemplate: {},
      })
      BackgroundGeolocation.stop()
      BackgroundGeolocationEvents.forEach(event => BackgroundGeolocation.removeAllListeners(event))
    }

    return result
  }
}
