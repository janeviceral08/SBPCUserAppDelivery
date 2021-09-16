import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import Cart from './CartScreen';
import Checkout from './CheckoutScreen';



const CartStack = createStackNavigator();

const CartStackScreen = ({navigation}) => (
    <CartStack.Navigator screenOptions={{
        headerStyle: {
        backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1aad57',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
         <CartStack.Screen name="CartScreen" component={Cart} options={{
             title: 'Cart',
            headerLeft: () => (
                <Icon.Button name="md-arrow-back" color={'#1aad57'} size={25} backgroundColor="#FFFFFF" style={{marginLeft: 10}} onPress={() => navigation.goBack()}></Icon.Button>
            )
            }} />
            <CartStack.Screen name="CheckoutScreen" component={Checkout} options={{
             title: 'Checkout',
            
            }} />
    </CartStack.Navigator>
);

export default CartStackScreen;
