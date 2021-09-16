import React, { Component } from 'react';
import { Dimensions, StyleSheet, FlatList, Image, TouchableOpacity,Text,View,ScrollView } from 'react-native';
import { Container, Content, Button, Left, Right, Icon, Card, CardItem, Badge} from 'native-base';
var {height, width } = Dimensions.get('window');
import Swiper from 'react-native-swiper'
import FastImage from 'react-native-fast-image'
import firestore from '@react-native-firebase/firestore';
import CategoryBlock from '../components/CategoryBlock'
import Loader from '../components/Loader';
import CustomHeader from './Header';

const BannerWidth = Dimensions.get('window').width;
export default class HomeScreen extends Component {
  constructor(props){
    super(props)
    this.ref =  firestore().collection('carousel');
    this.catref =  firestore().collection('categories');
    this.catref = this.catref.orderBy("id", "asc")
    this.state = {
      product: [],
      loading: false,
      categories:[],
      dataBanner:[],
      dataCategories:[],
      dataFood:[],
      selectCatg:0,
      rewards: [],
      featured: [],
 
    }
  }

  
  
  onCollectionUpdate = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      this.setState({
        product : doc.data().images,
        loading: false,
       
     });
    });
  }

  onCategoriesUpdate = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.setState({
      categories : stores,
      loading: false    
   });

  }




  componentDidMount() {
     this.setState({loading: true})

      this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
      this.subscribe = this.catref.onSnapshot(this.onCategoriesUpdate);

    }

    renderCategories() {
      let cat = [];
      console.log('carousel : ', this.state.categories )
      for(var i=0; i<this.state.categories.length; i++) {
        cat.push(
          <CategoryBlock key={this.state.categories[i].datas.id} id={this.state.categories[i].datas.id} image={this.state.categories[i].datas.image} title={this.state.categories[i].datas.title} navigation={this.props.navigation} />
        );
      }
      return cat;
    }

 
  render() {
    return (
      <Container style={{backgroundColor: '#f4f5f9'}}>
        <CustomHeader title="Kus I N A H A N G L A N" isHome={true} navigation={this.props.navigation}/>
        <Loader loading={this.state.loading}/>
     <ScrollView style={{flex: 1,}}>
         <View style={{paddingVertical: 5, paddingHorizontal: 10}} >
           <Swiper style={{height:width/2}} key={this.state.product.length} showsButtons={false} autoplay={true} autoplayTimeout={3}>
             {
               this.state.product.map((itembann,index)=>{
                 return(
             <Image style={styles.imageBanner} resizeMode="cover" source={{uri:itembann}} key={index}/>
                 )
               })
             }
           </Swiper>
       </View>
       {this.renderCategories()}
     
     </ScrollView>
   </Container>
    );
  }

}



const styles = StyleSheet.create({
  imageBanner: {
    height:width/2 -20,
    width:BannerWidth - 20,
    borderRadius:5,
  },
  divCategorie:{
    backgroundColor:'red',
    margin:5, alignItems:'center',
    borderRadius:5,
    padding:3
  },
  titleCatg:{
    fontSize:20,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:10,
    fontStyle: 'italic'
  },
  imageFood:{
    width:((width/2)-20)-10,
    height:((width/2)-20)-30,
    backgroundColor:'transparent',
    position:'absolute',
    top:-45
  },
  divFood:{
    width:(width/2)-20,
    padding:10,
    borderRadius:10,
    marginTop:55,
    marginBottom:5,
    marginLeft:10,
    alignItems:'center',
    elevation:8,
    shadowOpacity:0.3,
    shadowRadius:50,
    backgroundColor:'white',
  },
  
});