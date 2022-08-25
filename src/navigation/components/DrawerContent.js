import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Text, Icon } from 'native-base'
import _ from 'lodash'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { SafeAreaView, NavigationActions } from 'react-navigation'
import { DrawerNavigatorItems } from 'react-navigation-drawer'
import VersionNumber from 'react-native-version-number'
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
import { phonecall } from 'react-native-communications'

import Mailto from '../../components/Mailto'
import { selectIsAuthenticated } from '../../redux/App/selectors'

const phoneNumberUtil = PhoneNumberUtil.getInstance()

const blacklist = [
  'RegisterConfirmNav',
  'ResetPasswordNav',
  'AboutNav',
]

class DrawerContent extends Component {

  onItemPress({ route, focused }) {
    if (focused) {
      this.props.navigation.closeDrawer()
    } else {
      this.props.navigation.dispatch(
        NavigationActions.navigate({
          routeName: route.routeName,
          action: route.action,
        })
      )
    }
  }

  render() {

    const { items, restaurants, stores, user, isAuthenticated } = this.props

    const restaurantItems =
      _.filter(items, item => item.routeName === 'RestaurantNav')
    const storeItems =
      _.filter(items, item => item.routeName === 'StoreNav')
    const courierItems =
      _.filter(items, item => item.routeName === 'CourierNav')
    const accountItems =
      _.filter(items, item => item.routeName === 'AccountNav')

    const adminItems =
      _.filter(items, item => _.includes(['DispatchNav'], item.routeName))

    const otherItems = _.filter(items, item => {

      if (_.includes(blacklist, item.routeName)) {
        return false
      }

      if (_.includes(restaurantItems, item)
        || _.includes(storeItems, item)
        || _.includes(courierItems, item)
        || _.includes(accountItems, item)
        || _.includes(adminItems, item)) {
        return false
      }

      return true
    })

    const otherItemsProps = {
      ...this.props,
      items: otherItems,
    }

    let restaurantSection = (
      <View />
    )
    let storeSection = (
      <View />
    )
    let courierSection = (
      <View />
    )
    let adminSection = (
      <View />
    )

    if (isAuthenticated) {

      if ((user.hasRole('ROLE_ADMIN') || user.hasRole('ROLE_RESTAURANT')) && restaurants.length > 0) {

        let restaurantItemsProps

        // When there is ONE restaurant, show a direct link
        if (restaurants.length === 1) {
          restaurantItemsProps = {
            ...this.props,
            items: restaurants.map(restaurant => ({
              ...restaurantItems[0],
              params: { restaurant },
              action: NavigationActions.navigate({
                routeName: 'RestaurantHome',
                params: { restaurant },
              }),
            })),
            getLabel: ({ route }) => {
              const { restaurant } = route.params

              return restaurant.name
            },
          }
        } else {
          restaurantItemsProps = {
            ...this.props,
            items: restaurantItems,
            getLabel: ({ route }) => {
              return this.props.t('RESTAURANTS')
            },
          }
        }

        restaurantSection = (
          <View>
            <DrawerNavigatorItems
              { ...restaurantItemsProps }
              onItemPress={ this.onItemPress.bind(this) } />
          </View>
        )
      }

      if (user.hasRole('ROLE_STORE') && stores.length > 0) {
        let storeItemsProps

        // When there is ONE store, show a direct link
        if (stores.length === 1) {
          storeItemsProps = {
            ...this.props,
            items: stores.map(store => ({
              ...storeItems[0],
              params: {
                store,
              },
            })),
            getLabel: ({ route }) => {
              const { store } = route.params

              return store.name
            },
          }
        } else {
          storeItemsProps = {
            ...this.props,
            items: storeItems,
            getLabel: ({ route }) => {
              return this.props.t('STORES')
            },
          }
        }

        storeSection = (
          <View>
            <DrawerNavigatorItems
              { ...storeItemsProps }
              onItemPress={ this.onItemPress.bind(this) } />
          </View>
        )
      }

      if (user.hasRole('ROLE_COURIER')) {
        const courierItemsProps = {
          ...this.props,
          items: courierItems,
        }

        courierSection = (
          <View>
            <DrawerNavigatorItems { ...courierItemsProps } />
          </View>
        )
      }

      if (user.hasRole('ROLE_ADMIN')) {
        const adminItemsProps = {
          ...this.props,
          items: adminItems,
        }

        adminSection = (
          <View>
            <DrawerNavigatorItems { ...adminItemsProps } />
          </View>
        )
      }
    }

    const navigateToAccount = () =>
      this.props.navigation.dispatch(
        NavigationActions.navigate({ routeName: 'AccountNav' })
      )

    const navigateToAbout = () =>
      this.props.navigation.dispatch(
        NavigationActions.navigate({ routeName: 'AboutHome', params: { name: this.props.brandName } })
      )

    let phoneNumberText = this.props.phoneNumber
    if (this.props.phoneNumber) {
      try {
        phoneNumberText = phoneNumberUtil.format(
          phoneNumberUtil.parse(this.props.phoneNumber),
          PhoneNumberFormat.NATIONAL
        )
      } catch (e) {}
    }

    return (
      <SafeAreaView style={ styles.container } forceInset={{ top: 'always', horizontal: 'never' }}>
        <TouchableOpacity style={ styles.header } onPress={ navigateToAccount } testID="drawerAccountBtn">
          <Icon name="person" />
          { isAuthenticated && <Text>{ this.props.user.username }</Text> }
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={ styles.content }>
            <DrawerNavigatorItems { ...otherItemsProps } itemsContainerStyle={ styles.itemsContainer } />
            { restaurantSection }
            { storeSection }
            { courierSection }
            { adminSection }
          </View>
          <View style={ styles.footer }>
            { this.props.showAbout && (
              <TouchableOpacity onPress={ navigateToAbout } style={ styles.footerItem }>
                <Text style={{ fontWeight: '700' }}>{ this.props.brandName }</Text>
              </TouchableOpacity>
            )}
            { !this.props.showAbout && (
              <View style={ styles.footerItem }>
                <Text style={{ fontWeight: '700' }}>{ this.props.brandName }</Text>
              </View>
            )}
            { this.props.email && (
              <Mailto email={ this.props.email } style={ styles.footerItem }>
                <Text style={{ fontSize: 14 }}>{ this.props.email }</Text>
              </Mailto>
            )}
            { this.props.phoneNumber && (
              <TouchableOpacity onPress={ () => phonecall(this.props.phoneNumber, true) } style={ styles.footerItem }>
                <Text style={{ fontSize: 14 }}>{ phoneNumberText }</Text>
              </TouchableOpacity>
            )}
            <View style={ styles.footerItem }>
              <Text note>{ VersionNumber.appVersion }</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  itemsContainer: {
    paddingVertical: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 25,
  },
  content: {
    flex: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 5
  },
  footerItem: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
})

function mapStateToProps(state) {

  const publicServers =
    _.filter(state.app.servers, s => !!s.coopcycle_url)

  const showAbout =
    _.includes(publicServers.map(s => s.coopcycle_url), state.app.baseURL)

  return {
    user: state.app.user,
    isAuthenticated: selectIsAuthenticated(state),
    restaurants: state.restaurant.myRestaurants,
    stores: state.store.myStores,
    brandName: state.app.settings['brand_name'],
    phoneNumber: state.app.settings['phone_number'],
    email: state.app.settings['administrator_email'],
    showAbout,
  }
}

export default connect(mapStateToProps)(withTranslation()(DrawerContent))
