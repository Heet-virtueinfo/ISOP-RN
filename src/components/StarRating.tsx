import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '../theme';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  style,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
      const isFilled = i <= rating;
      const isHalf = !isFilled && i - 0.5 <= rating;

      let element;
      if (isFilled) {
        element = <Star size={size} color="#FBBF24" fill="#FBBF24" />;
      } else if (isHalf) {
        element = (
          <View style={{ position: 'relative' }}>
            <Star size={size} color={colors.text.tertiary} />
            <View style={{ position: 'absolute', overflow: 'hidden', width: '50%' }}>
              <Star size={size} color="#FBBF24" fill="#FBBF24" />
            </View>
          </View>
        );
      } else {
        element = <Star size={size} color={colors.layout.divider} />;
      }

      if (interactive) {
        stars.push(
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => onRatingChange?.(i)}
            style={styles.starWrapper}
          >
            {element}
          </TouchableOpacity>
        );
      } else {
        stars.push(
          <View key={i} style={styles.starWrapper}>
            {element}
          </View>
        );
      }
    }
    return stars;
  };

  return <View style={[styles.container, style]}>{renderStars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    marginHorizontal: 2,
  },
});

export default StarRating;
