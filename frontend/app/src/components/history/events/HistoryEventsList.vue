<script setup lang="ts">
import { type DataTableHeader } from 'vuetify';
import { type HistoryEventEntry } from '@/types/history/events';

const props = withDefaults(
  defineProps<{
    eventGroupHeader: HistoryEventEntry;
    allEvents: HistoryEventEntry[];
    colspan: number;
    showEventDetail?: boolean;
    loading?: boolean;
  }>(),
  {
    showEventDetail: false,
    loading: false
  }
);

const emit = defineEmits<{
  (e: 'edit:event', data: HistoryEventEntry): void;
  (
    e: 'delete:event',
    data: {
      canDelete: boolean;
      item: HistoryEventEntry;
    }
  ): void;
}>();

const { eventGroupHeader, allEvents } = toRefs(props);

const css = useCssModule();
const { tc } = useI18n();

const { getChain } = useSupportedChains();

const headers: DataTableHeader[] = [
  {
    text: tc('common.type'),
    value: 'type',
    sortable: false,
    cellClass: css['row__type']
  },
  {
    text: tc('common.asset'),
    value: 'asset',
    sortable: false
  },
  {
    text: tc('common.description'),
    value: 'description',
    sortable: false,
    cellClass: css['row__description']
  },
  {
    text: '',
    value: 'actions',
    align: 'end',
    sortable: false,
    cellClass: css['row__actions']
  }
];

const evaluating: Ref<boolean> = ref(false);

const events: Ref<HistoryEventEntry[]> = asyncComputed(() => {
  const all = get(allEvents);
  const eventHeader = get(eventGroupHeader);
  if (all.length === 0) {
    return [eventHeader];
  }
  const eventIdentifierHeader = eventHeader.eventIdentifier;
  const filtered = all.filter(
    ({ eventIdentifier }) => eventIdentifier === eventIdentifierHeader
  );

  if (filtered.length > 0) {
    return filtered;
  }

  return [eventHeader];
}, []);

const editEvent = (item: HistoryEventEntry) => emit('edit:event', item);
const deleteEvent = (item: HistoryEventEntry) =>
  emit('delete:event', { item, canDelete: get(events).length > 1 });

const ignoredInAccounting: ComputedRef<boolean> = computed(
  () => !!get(events)[0]?.ignoredInAccounting
);

const panel = ref<number[]>(get(ignoredInAccounting) ? [] : [0]);

watch(ignoredInAccounting, (current, old) => {
  if (old && !current) {
    panel.value = [0];
  } else if (!old && current) {
    panel.value = [];
  }
});

const isNoTxHash = (item: HistoryEventEntry) =>
  item.counterparty === 'eth2' && item.eventSubtype === 'deposit asset';
</script>

<template>
  <table-expand-container
    :colspan="colspan - 1"
    :offset="1"
    :padded="false"
    visible
  >
    <template #append>
      <v-expansion-panels
        v-model="panel"
        :class="css['expansions-panels']"
        multiple
      >
        <v-expansion-panel>
          <v-expansion-panel-header
            v-if="ignoredInAccounting && events.length > 0"
          >
            <template #default="{ open }">
              <div class="primary--text font-weight-bold">
                {{
                  open
                    ? tc('transactions.events.view.hide')
                    : tc('transactions.events.view.show', 0, {
                        length: events.length
                      })
                }}
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div
              class="my-n4"
              :class="{
                'pt-4': ignoredInAccounting && events.length > 0
              }"
            >
              <data-table
                :class="css.table"
                :headers="headers"
                :items="events"
                :loading="loading || evaluating"
                :loading-text="tc('transactions.events.loading')"
                :no-data-text="tc('transactions.events.no_data')"
                class="transparent"
                hide-default-footer
                :hide-default-header="$vuetify.breakpoint.mdAndUp"
              >
                <template #progress><span /></template>
                <template #item.type="{ item }">
                  <history-event-type
                    :event="item"
                    :chain="getChain(item.location)"
                  />
                </template>
                <template #item.asset="{ item }">
                  <history-event-asset
                    :event="item"
                    :show-event-detail="showEventDetail"
                  />
                </template>
                <template #item.description="{ item }">
                  <history-event-note
                    :notes="item.notes"
                    :amount="item.balance.amount"
                    :asset="item.asset"
                    :chain="getChain(item.location)"
                    :no-tx-hash="isNoTxHash(item)"
                    :validator-index="item.validatorIndex"
                  />
                </template>
                <template #item.actions="{ item }">
                  <row-actions
                    :delete-tooltip="tc('transactions.events.actions.delete')"
                    :edit-tooltip="tc('transactions.events.actions.edit')"
                    @edit-click="editEvent(item)"
                    @delete-click="deleteEvent(item)"
                  />
                </template>
              </data-table>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </table-expand-container>
</template>

<style lang="scss" module>
.table {
  :global {
    .v-data-table {
      &__wrapper {
        overflow-x: hidden;

        tbody {
          tr {
            &:hover {
              background-color: transparent !important;
            }

            td {
              padding-top: 1rem !important;
              padding-bottom: 1rem !important;

              @media screen and (max-width: 599px) {
                padding-left: 0 !important;
                padding-right: 0 !important;
              }
            }
          }
        }
      }
    }
  }
}

.row {
  &__type {
    width: 250px;
    padding-left: 0 !important;
  }

  &__description {
    width: 40%;
    min-width: 300px;
    line-height: 1.5rem;
    word-break: break-word;
  }

  &__actions {
    width: 1px;
    padding-right: 0 !important;
  }
}

.expansions {
  &-panels {
    :global {
      .v-expansion-panel {
        background: transparent !important;

        &::before {
          box-shadow: none;
        }

        &-header {
          padding: 0;
          min-height: auto;
          width: auto;
        }

        &-content {
          &__wrap {
            padding: 0;
          }
        }
      }
    }
  }
}
</style>
