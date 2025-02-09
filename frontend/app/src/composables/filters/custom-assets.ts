import { type MaybeRef } from '@vueuse/core';
import { type ComputedRef, type Ref } from 'vue';
import { z } from 'zod';
import { type MatchedKeyword, type SearchMatcher } from '@/types/filtering';

enum CustomAssetFilterKeys {
  NAME = 'name',
  CUSTOM_ASSET_TYPE = 'type'
}

enum CustomAssetFilterValueKeys {
  NAME = 'name',
  CUSTOM_ASSET_TYPE = 'custom_asset_type'
}

export type Matcher = SearchMatcher<
  CustomAssetFilterKeys,
  CustomAssetFilterValueKeys
>;
export type Filters = MatchedKeyword<CustomAssetFilterValueKeys>;

export const useCustomAssetFilter = (suggestions: MaybeRef<string[]>) => {
  const filters: Ref<Filters> = ref({});

  const { tc } = useI18n();

  const matchers: ComputedRef<Matcher[]> = computed(() => [
    {
      key: CustomAssetFilterKeys.NAME,
      keyValue: CustomAssetFilterValueKeys.NAME,
      description: tc('assets.filter.name'),
      string: true,
      suggestions: () => [],
      hint: tc('assets.filter.name_hint'),
      validate: () => true
    },
    {
      key: CustomAssetFilterKeys.CUSTOM_ASSET_TYPE,
      keyValue: CustomAssetFilterValueKeys.CUSTOM_ASSET_TYPE,
      description: tc('assets.filter.type'),
      string: true,
      suggestions: () => get(suggestions),
      hint: tc('assets.filter.type_hint'),
      validate: (value: string) => get(suggestions).includes(value)
    }
  ]);

  const updateFilter = (newFilters: Filters) => {
    set(filters, newFilters);
  };

  const OptionalString = z.string().optional();
  const RouteFilterSchema = z.object({
    [CustomAssetFilterValueKeys.NAME]: OptionalString,
    [CustomAssetFilterValueKeys.CUSTOM_ASSET_TYPE]: OptionalString
  });

  return {
    filters,
    matchers,
    updateFilter,
    RouteFilterSchema
  };
};
