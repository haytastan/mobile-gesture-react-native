import React from 'react'
import { StyleSheet } from 'react-native'
import { Icon } from 'native-base'

import { resolveFulfillmentMethod } from '../utils/order'

const styles = StyleSheet.create({
  small: {
    fontSize: 20,
  }
})

export default ({ order, small }) => {

  const fulfillmentMethod = resolveFulfillmentMethod(order)

  return (
    <Icon type="FontAwesome"
      style={ small ? [ styles.small ] : [] }
      name={ fulfillmentMethod === 'collection' ? 'cube' : 'bicycle' } />
  )
}
