
import React, { useState, useEffect,memo } from 'react';
import {View, Text} from 'react-native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
 
import HomeScreen from './HomeScreen';
import OrderScreen from './OrderScreen';
import ExploreScreen from './ExploreScreen';
import ProfileScreen from './ProfileScreen';
import Stores from './StoreScreen';
import Products from '../components/ProductCard';
import ProductScreen from './ProductScreen';
import Cart from './CartScreen';
import CartStackScreen from './CartStackScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Profile from './ProfileEdit';
import CartBadge from '../components/CartBadge';
import Address from './AddressEdit';
import Searchbar from '../components/Searchbar';
import MyVoucherScreen from './MyVoucherScreen';
import OrderDetails from './OrderDetails';
import VoucherScreen from './VoucherScreen';


const HomeStack = createStackNavigator();
const OrderStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const MainTabScreen = () => (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="tomato"
      inactiveColor= "grey"
      
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarColor: '#FFFFFF',
          tabBarIcon: ({ color }) => (
            <Icon name="food-apple-outline" color={color} size={26} />
          ),
        }}
      />
    
      <Tab.Screen
        name="Orders"
        component={OrderStackScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarColor: '#FFFFFF',
          tabBarIcon: ({ color }) => (
            <Icon name="clipboard-text-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={VoucherScreen}
        options={{
          tabBarLabel: 'Notification',
          tabBarColor: '#FFFFFF',
          tabBarIcon: ({ color }) => (
            <Icon name="bell-circle-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilestackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarColor: '#FFFFFF',
          tabBarIcon: ({ color }) => (
            <Icon name="account-circle-outline" color={color} size={26} />
          ),
        }}
      />
      
    </Tab.Navigator>
);


export default MainTabScreen;


const HomeStackScreen = ({navigation}) => (

<HomeStack.Navigator screenOptions={{
        headerStyle: {
        backgroundColor: '#FFFFFF',
        },
        headerTintColor: 'tomato',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
        <HomeStack.Screen name="Home" component={HomeScreen} options={{
        title:'K u s I N A H A N G L A N',
        headerLeft: () => (
            <Icon.Button name="menu" size={25} color={'tomato'} backgroundColor="#ffffff" onPress={() => navigation.openDrawer()}></Icon.Button>
        ),
        headerRight: () => (<CartBadge navigation={navigation}/>)
        }} />
        <HomeStack.Screen name="StoreScreen" component={Stores} 
        options={{
        title: 'Stores',
        headerRight: () => (
          <CartBadge navigation={navigation}/>
      )
        }}/>
        <HomeStack.Screen name="ProductScreen" component={ProductScreen} 
        options={({ route }) => 
        ({ title: route.params.name, headerRight: () => (
          
          <CartBadge navigation={navigation}/>
      ) })}
        />
        <HomeStack.Screen name="Searchbar" component={Searchbar}  options={{
        title: 'Search Products',
        headerRight: () => (
          <CartBadge navigation={navigation}/>
      )
        }}/>
</HomeStack.Navigator>
);

const OrderStackScreen = ({navigation}) => (
<OrderStack.Navigator screenOptions={{
        headerStyle: {
        backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1aad57',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
        <OrderStack.Screen name="Orders" component={OrderScreen} options={{
        headerLeft: () => (
            <Icon.Button name="menu" color={'#1aad57'} size={25} backgroundColor="#FFFFFF" onPress={() => navigation.openDrawer()}></Icon.Button>
        )
        }} />
        <OrderStack.Screen name="OrderDetails" component={OrderDetails} options={{title: 'Order Details'}} />
</OrderStack.Navigator>
);

const ProfilestackScreen = ({navigation}) => (
  <ProfileStack.Navigator screenOptions={{
          headerStyle: {
          backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1aad57',
          headerTitleStyle: {
          fontWeight: 'bold'
          }
      }}>
          <ProfileStack.Screen name="Account" component={ProfileScreen} options={{
             title: 'Account',
          headerLeft: () => (
            <Icon.Button name="menu" size={25} color={'#1aad57'} backgroundColor="#ffffff" onPress={() => navigation.openDrawer()}></Icon.Button>
        ),
          }} />
          <ProfileStack.Screen name="Profile" component={Profile}/>
           <ProfileStack.Screen name="Address" component={Address}  />
           <ProfileStack.Screen name="My Vouchers" component={MyVoucherScreen}  />
  </ProfileStack.Navigator>
  );

