import {
  INIT_REQUEST,
  INIT_SUCCESS,
  INIT_FAILURE,
  REMOVE_ITEM,
  UPDATE_ITEM_QUANTITY,
  SET_ADDRESS,
  SET_ADDRESS_OK,
  SET_DATE,
  SET_TIMING,
  CLEAR,
  RESET_RESTAURANT,
  LOAD_RESTAURANTS_REQUEST,
  LOAD_RESTAURANTS_SUCCESS,
  LOAD_RESTAURANTS_FAILURE,
  CHECKOUT_REQUEST,
  CHECKOUT_SUCCESS,
  CHECKOUT_FAILURE,
  SHOW_ADDRESS_MODAL,
  HIDE_ADDRESS_MODAL,
  UPDATE_CART_SUCCESS,
  SET_CHECKOUT_LOADING,
  ADD_ITEM_REQUEST,
  ADD_ITEM_REQUEST_FINISHED,
  SET_CART_VALIDATION,
  SHOW_EXPIRED_SESSION_MODAL,
  HIDE_EXPIRED_SESSION_MODAL,
  SESSION_EXPIRED,
  SET_ADDRESS_MODAL_HIDDEN,
  SET_ADDRESS_MODAL_MESSAGE,
} from './actions'

import i18n from '../../i18n'
import _ from 'lodash'

const initialState = {
  cart: null,
  address: null,
  isAddressOK: null,
  addressModalMessage: '',
  date: null,
  restaurants: [],
  menu: null,
  isFetching: false,
  errors: [],
  isAddressModalVisible: false,
  // This is used to make sure address modal is hidden,
  // before showing expired session modal
  // @see https://github.com/react-native-community/react-native-modal#i-cant-show-multiple-modals-one-after-another
  isAddressModalHidden: true,
  timing: {},
  isValid: null,
  violations: [],
  isLoading: false,
  itemRequestStack: [],
  token: null,
  isExpiredSessionModalVisible: false,
  isSessionExpired: false,
}

export default (state = initialState, action = {}) => {

  switch (action.type) {

    case LOAD_RESTAURANTS_REQUEST:
    case CHECKOUT_REQUEST:
      return {
        ...state,
        isFetching: true,
      }

    case LOAD_RESTAURANTS_FAILURE:
    case INIT_FAILURE:
      return {
        ...state,
        isFetching: false,
      }

    case CHECKOUT_FAILURE:

      let errors = [ i18n.t('TRY_LATER') ]

      if (action.payload.hasOwnProperty('@context')
        && action.payload.hasOwnProperty('@type')
        && action.payload.hasOwnProperty('violations')
        && Array.isArray(action.payload.violations)) {
        errors = action.payload.violations.map(violation => violation.message)
      }

      return {
        ...state,
        errors,
        isFetching: false,
      }

    case INIT_REQUEST:

      return {
        ...state,
        isFetching: true,
        isSessionExpired: false,
        restaurant: action.payload.restaurant,
        cart: null,
        menu: null, // For better navigation through restaurants
      }

    case RESET_RESTAURANT:

      return {
        ...state,
        restaurant: action.payload.restaurant,
        cart: null,
        menu: null, // For better navigation through restaurants
      }

    case INIT_SUCCESS:

      return {
        ...state,
        isFetching: false,
        restaurant: action.payload.restaurant,
        cart: action.payload.cart,
        menu: action.payload.restaurant.hasMenu,
        token: action.payload.token,
        isAddressOK: null, // We don't know if it's valid
        itemRequestStack: [],
      }

    case CLEAR:
      return {
        ...state,
        cart: null,
        address: null,
        date: null,
        itemRequestStack: [],
      }

    case REMOVE_ITEM:

      return {
        ...state,
        cart: {
          ...state.cart,
          items: _.filter(state.cart.items, item => item.id !== action.payload.id),
        },
      }

    case UPDATE_ITEM_QUANTITY:

      return {
        ...state,
        cart: {
          ...state.cart,
          items: _.map(state.cart.items, item => {
            if (item.id === action.payload.item.id) {

              return {
                ...item,
                quantity: action.payload.quantity,
              }
            }

            return item
          }),
        },
      }

    case SET_ADDRESS:
      return {
        ...state,
        address: action.payload,
      }

    case SET_ADDRESS_OK:
      return {
        ...state,
        isAddressOK: action.payload,
      }

    case SET_DATE:
      return {
        ...state,
        date: action.payload,
      }

    case LOAD_RESTAURANTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        restaurants: action.payload,
      }

    case CHECKOUT_SUCCESS:
      return {
        ...state,
        isFetching: false,
      }

    case SHOW_ADDRESS_MODAL:
      return {
        ...state,
        isAddressModalVisible: true,
        addressModalMessage: action.payload || state.addressModalMessage,
      }

    case HIDE_ADDRESS_MODAL:
      return {
        ...state,
        isAddressModalVisible: false,
        addressModalMessage: initialState.addressModalMessage,
      }

    case SET_ADDRESS_MODAL_MESSAGE:
      return {
        ...state,
        addressModalMessage: action.payload,
      }

    case SET_TIMING:
      return {
        ...state,
        timing: action.payload,
      }

    case SET_CART_VALIDATION:
      return {
        ...state,
        isValid: action.payload.isValid,
        violations: action.payload.violations,
      }

    case UPDATE_CART_SUCCESS:
      return {
        ...state,
        cart: action.payload,
      }

    case SET_CHECKOUT_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case ADD_ITEM_REQUEST:
      return {
        ...state,
        itemRequestStack: state.itemRequestStack.concat(action.payload.identifier),
        addressModalMessage: initialState.addressModalMessage,
      }

    case ADD_ITEM_REQUEST_FINISHED:

      const itemRequestIndex = _.findLastIndex(state.itemRequestStack, identifier => identifier === action.payload.identifier)
      if (itemRequestIndex === -1) {
        return state
      }

      const newItemRequestStack = state.itemRequestStack.slice()
      newItemRequestStack.splice(itemRequestIndex, 1)

      return {
        ...state,
        itemRequestStack: newItemRequestStack,
      }

    case SHOW_EXPIRED_SESSION_MODAL:

      return {
        ...state,
        isExpiredSessionModalVisible: true,
      }

    case HIDE_EXPIRED_SESSION_MODAL:

      return {
        ...state,
        isExpiredSessionModalVisible: false,
      }

    case SESSION_EXPIRED:

      return {
        ...state,
        isSessionExpired: true,
        isExpiredSessionModalVisible: true,
      }

    case SET_ADDRESS_MODAL_HIDDEN:

      return {
        ...state,
        isAddressModalHidden: action.payload,
      }
  }

  return state
}
