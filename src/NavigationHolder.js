// @see https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html

import { NavigationActions } from 'react-navigation'

export default class NavigationHolder {

  static topLevelNavigator

  static setTopLevelNavigator(topLevelNavigator) {
    this.topLevelNavigator = topLevelNavigator
  }

  static navigate(routeName, params) {
    return this.topLevelNavigator.dispatch(
      NavigationActions.navigate({
        routeName,
        params,
      })
    )
  }

  static dispatch(action) {
    return this.topLevelNavigator.dispatch(action)
  }

  static goBack() {
    return this.topLevelNavigator.dispatch(
      NavigationActions.back({
        key: null,
      })
    )
  }

}
