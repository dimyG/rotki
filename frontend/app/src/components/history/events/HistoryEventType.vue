<script setup lang="ts">
import { type Blockchain } from '@rotki/common/lib/blockchain';
import { type HistoryEventEntry } from '@/types/history/events';
import { isValidTxHash } from '@/utils/text';

const props = defineProps<{
  event: HistoryEventEntry;
  chain: Blockchain;
}>();

const { event } = toRefs(props);

const { dark } = useTheme();
const { getEventTypeData, getEventCounterpartyData } =
  useHistoryEventMappings();

const attrs = getEventTypeData(event);
const counterparty = getEventCounterpartyData(event);

const isTx: ComputedRef<boolean> = computed(() =>
  isValidTxHash(get(event).eventIdentifier)
);

const { t } = useI18n();
const imagePath = '/assets/images/protocols/';
</script>

<template>
  <div class="d-flex align-center text-left">
    <v-badge v-if="counterparty || event.address" avatar overlap color="white">
      <template #badge>
        <v-tooltip top>
          <template #activator="{ on }">
            <div v-on="on">
              <v-avatar v-if="counterparty">
                <v-icon v-if="counterparty.icon" :color="counterparty.color">
                  {{ counterparty.icon }}
                </v-icon>

                <v-img
                  v-else-if="counterparty.image"
                  :src="`${imagePath}${counterparty.image}`"
                  contain
                />

                <ens-avatar v-else :address="counterparty.label" />
              </v-avatar>
              <v-avatar v-else>
                <ens-avatar :address="event.address" />
              </v-avatar>
            </div>
          </template>
          <div>{{ counterparty?.label || event.address }}</div>
        </v-tooltip>
      </template>
      <v-avatar
        class="text--darken-4"
        :color="dark ? 'white' : 'grey lighten-3'"
        :size="36"
      >
        <v-icon :size="20" :color="attrs.color || 'grey darken-2'">
          {{ attrs.icon }}
        </v-icon>
      </v-avatar>
    </v-badge>
    <v-avatar
      v-else
      class="text--darken-4"
      :color="dark ? 'white' : 'grey lighten-3'"
      :size="36"
    >
      <v-icon :size="20" :color="attrs.color || 'grey darken-2'">
        {{ attrs.icon }}
      </v-icon>
    </v-avatar>
    <div class="ml-4">
      <div class="font-weight-bold text-uppercase">{{ attrs.label }}</div>
      <div v-if="event.locationLabel" class="grey--text">
        <hash-link
          :show-icon="isTx"
          :no-link="!isTx"
          :text="event.locationLabel"
          :chain="chain"
        />
      </div>
      <div v-if="event.customized" class="pt-1">
        <v-chip small label color="primary accent-1">
          <v-icon x-small> mdi-file-document-edit </v-icon>
          <div class="pl-2 text-caption font-weight-bold">
            {{ t('transactions.events.customized_event') }}
          </div>
        </v-chip>
      </div>
    </div>
  </div>
</template>
