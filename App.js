import React from 'react';

import { Button, Text, View, TouchableOpacity, StyleSheet,Dimensions } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import Stores from './screens/StoreScreen';
import ProductScreen from './screens/ProductScreen';
import Searchbar from './components/Searchbar';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPassword from './screens/ForgotPassword';
import OrderScreen from './screens/OrderScreen';
import OrderDetails from './screens/OrderDetails';
import ProfileScreen from './screens/ProfileScreen';
import Profile from './screens/ProfileEdit';
import Address from './screens/AddressEdit';
import SplashScreen from './screens/SplashScreen';
import SettingsScreen from './screens/SettingsScreen';
import SupportScreen from './screens/SupportScreen';
import SideMenu from './screens/SideMenu';
import Cart from './screens/CartScreen';
import Checkout from './screens/CheckoutScreen';
import VoucherScreen from "./screens/VoucherScreen";
import MyVoucherScreen from './screens/MyVoucherScreen';
import 'react-native-gesture-handler';
import FastFoods from './screens/Fastfoods';
import ChatScreen from './screens/ChatScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTab=({children, onPress}) =>(
  <TouchableOpacity
  style={{
    top: -30,
    justifyContent: 'center',
  alignItems: 'center',...styles.shadow}}
  onPress={onPress}>
    <View
    style={{
      width: 50,
      height: 50,
      borderRadius: 35,
      backgroundColor: 'red'
    }}
    
    >
      {children}
    </View>
  </TouchableOpacity>
);

function SettingsStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{headerShown:false}}
        />  
        <Stack.Screen 
        name="Edit" 
        component={Profile} 
        options={{headerShown:false}}
        />  
        <Stack.Screen 
        name="Address" 
        component={Address} 
        options={{headerShown:false}}
        />  
        <Stack.Screen 
        name="MyVoucher" 
        component={MyVoucherScreen} 
        options={{headerShown:false}}
        /> 
        
    </Stack.Navigator>
  );
}

function OrderStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Orders" 
        component={OrderScreen} 
        options={{headerShown:false}}/>  
        <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetails} 
        options={{headerShown:false}}/> 
    </Stack.Navigator>
  );
}



function TabScreen() {
  return (
    <Tab.Navigator tabBarOptions={{
      activeTintColor: '#e87b1c',
      inactiveTintColor: 'black',
      style: {
        backgroundColor: 'salmon',
    
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      },
      
    }}
    initialRouteName="Home"
    >
       
       
        
        <Tab.Screen 
            name="Shop" 
            component={HomeStack}
            options={{headerShown:false,
              tabBarLabel: 'Shop',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'isv'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
            }} 
            />  
              <Tab.Screen 
            name="Orders" 
            component={OrderStack} 
            options={{headerShown:false,
              tabBarLabel: 'Orders',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'profile'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
           
            }}
            
            />   
              <Tab.Screen 
          name="Vouchers" 
          component={VoucherScreen}
          options={{headerShown:false,
            tabBarLabel: 'Vouchers',
            tabBarIcon: ({focused, color, size, tintColor}) => (
              <AntDesign name={'wallet'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
            ),
            
          }}
        
        />  
             <Tab.Screen 
            name="Account" 
            component={SettingsStack} 
            options={{headerShown:false,
              tabBarLabel: 'Account',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'user'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
           
            }}
            
            />   
    </Tab.Navigator>
  );
}
function CheckoutStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Checkout" 
        component={Checkout} 
        options={{headerShown:false}}/>  
  
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Categories"
        component={HomeScreen}
        options={{headerShown:false}}
      />
       <Stack.Screen
        name="Stores"
        component={Stores}
        options={{
          headerShown:false,
          tabBarVisible:false,
        }}
        tabBarOptions={{
          tabStyle: {height: 0},
          style: {backgroundColor: 'transparent'}
        }}
      />
      <Stack.Screen
        name="Products"
        component={ProductScreen}
        options={{headerShown:false,tabBarVisible:false,}}
      />
      <Stack.Screen
        name="Fastfood"
        component={FastFoods}
        options={{headerShown:false,tabBarVisible:false,}}
      />
      <Stack.Screen
        name="Search"
        component={Searchbar}
        options={{headerShown:false,tabBarVisible:false,}}
      />
      <Stack.Screen
        name="Cart"
        component={Cart}
        options={{headerShown:false,tabBarVisible:false,}}
      />
       <Stack.Screen 
        name="Address" 
        component={Address} 
        options={{headerShown:false}}
        /> 
          <Stack.Screen 
        name="MyVoucher" 
        component={MyVoucherScreen} 
        options={{headerShown:false}}
        /> 
              <Stack.Screen 
        name="Checkout" 
        component={Checkout} 
        options={{headerShown:false}}/>  
       
    </Stack.Navigator>
  );
}

const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator>
           <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown:false}}
          />
          <Stack.Screen
            name="Login"
            component={SignInScreen}
            options={{headerShown:false}}
          />
           <Stack.Screen
            name="Signup"
            component={SignUpScreen}
            options={{ title: "UserInfo"}}
          />
             <Stack.Screen
            name="ForgotPass"
            component={ForgotPassword}
            options={{headerShown:false}}
          />
           <Stack.Screen
          name="Home"
          component={TabScreen}
          options={{ headerShown: false }}
        />
        </Stack.Navigator>
      </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  shadow:{
    shadowColor: '#7f5df0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius:3.5,
    elevation:5
  }
})

export default App;
