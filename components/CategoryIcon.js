import React from 'react';
import { View } from 'react-native';
import { theme } from '../constants/theme';

import PillRent from './icons/DashboardIconHomePillRent80';
import PillTransport from './icons/DashboardIconCarPillTransport60';
import PillDebit from './icons/DashboardIconCardPillDebit45';
import PillGroceries from './icons/DashboardIconBasketPillGroceries30';
import PillSavings from './icons/DashboardIconPiggybankPillSavings41';
import HeroRent from './icons/DashboardIconRentCardTopRight80';
import HeroTransport from './icons/DashboardIconTransportCardTopRight60';
import HeroDebit from './icons/DashboardIconCardCardTopRight45';
import HeroGroceries from './icons/DashboardIconGroceriesCardTopRight30';
import HeroSavings from './icons/DashboardIconSavingsCardTopRight41';
import OverTransport from './icons/DashboardOverTransport60';
import OverDebit from './icons/DashboardOverDebitOrders60';
import OverGroceries from './icons/DashboardOverGroceries32';

const PILL = { rent: PillRent, transport: PillTransport, debit: PillDebit, groceries: PillGroceries, savings: PillSavings };
const HERO = { rent: HeroRent, transport: HeroTransport, debit: HeroDebit, groceries: HeroGroceries, savings: HeroSavings };
// The designer made orange "Over" icons for these three only.
const OVER = { transport: OverTransport, debit: OverDebit, groceries: OverGroceries };

// One place that decides how a category icon looks:
//   visual: result of getCategoryVisual() (opacity tier / over state), optional.
//   variant: 'pill' (small, in the pill bar) or 'hero' (large, in the hero card).
export default function CategoryIcon({ categoryKey, size = 30, variant = 'pill', visual }) {
  const isOver = Boolean(visual && visual.isOver);
  const OverIcon = OVER[categoryKey];

  if (isOver && OverIcon) {
    return <OverIcon width={size} height={size} />;
  }

  const Icon = (variant === 'hero' ? HERO : PILL)[categoryKey];
  if (!Icon) return null;

  if (isOver) {
    // No orange asset for this category (rent): sit the icon on an orange disc instead.
    const disc = size + 12;
    return (
      <View
        style={{
          width: disc,
          height: disc,
          borderRadius: disc / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.colors.warning,
          backgroundColor: theme.colors.warningSurface,
        }}
      >
        <Icon width={size} height={size} />
      </View>
    );
  }

  return (
    <View style={{ opacity: visual ? visual.opacity : 1 }}>
      <Icon width={size} height={size} />
    </View>
  );
}
