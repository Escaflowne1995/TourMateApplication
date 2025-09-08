// HorizontalCarousel.js - Reusable horizontal carousel component
import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import AttractionCard from './AttractionCard';

const { width: screenWidth } = Dimensions.get('window');

const HorizontalCarousel = ({ 
  title, 
  data, 
  onItemPress, 
  colors, 
  showRating = false,
  cardStyle = 'default'
}) => {
  const styles = getStyles(colors);

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <AttractionCard
        attraction={item}
        onPress={onItemPress}
        colors={colors}
        showRating={showRating}
        cardStyle={cardStyle}
      />
    </View>
  );

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={screenWidth * 0.8}
        pagingEnabled={false}
      />
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  listContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  cardContainer: {
    width: screenWidth * 0.75,
    marginRight: 15,
  },
});

export default HorizontalCarousel; 