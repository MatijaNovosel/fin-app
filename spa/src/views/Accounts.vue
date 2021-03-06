<template>
  <v-row>
    <v-col cols="12">
      <v-card class="pa-4 rounded-lg text-center" height="450">
        <h4 class="mb-5 grey--text lighten-2 text-overline">
          {{
            `Total changes ${
              state.account
                ? `(${
                    state.accounts.filter(x => x.id == state.account)[0]
                      .description
                  })`
                : ""
            }`
          }}
        </h4>
        <line-chart
          ref="lineChart"
          style="height: 370px"
          v-if="state.graphData"
          :chart-data="state.graphData"
          :options="graphOptions"
        />
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-select
        @change="getData"
        :loading="state.loading"
        :disabled="state.loading"
        hide-details
        dense
        item-text="description"
        item-value="id"
        :return-object="false"
        :items="state.accounts"
        v-model="state.account"
        outlined
        label="Account"
      >
        <template #append-outer>
          <v-btn icon @click="deleteAccount">
            <v-icon color="red">
              mdi-delete
            </v-icon>
          </v-btn>
        </template>
        <template #item="{ item, on, attrs }">
          <v-list-item two-line v-on="on" v-bind="attrs">
            <v-list-item-avatar>
              <v-icon v-text="`mdi-${item.icon}`" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.description }}
              </v-list-item-title>
              <v-list-item-subtitle class="pt-1">
                {{ formatCurrencyDisplay(true, item.amount, "HRK") }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template #selection="{ item }">
          <v-list-item two-line>
            <v-list-item-avatar>
              <v-icon v-text="`mdi-${item.icon}`" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.description }}
              </v-list-item-title>
              <v-list-item-subtitle class="pt-1">
                {{ formatCurrencyDisplay(true, item.amount, "HRK") }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { getService, Types } from "@/di-container";
import { IAccountService } from "@/interfaces/accountService";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch
} from "@vue/composition-api";
import { formatCurrencyDisplay } from "@/helpers";
import { GraphData, GraphOptions } from "@/models/graph";
import { ITransactionService } from "@/interfaces/transactionService";
import { User } from "@/models/user";
import LineChart from "@/components/charts/LineChart";
import { AccountLatestValueModel } from "@/apiClient/client";
import { format } from "date-fns";
import { IHistoryService } from "@/interfaces/historyService";

interface State {
  accounts: AccountLatestValueModel[];
  account: number | null;
  loading: boolean;
  graphData: GraphData | null;
}

export default defineComponent({
  name: "Accounts",
  components: {
    LineChart
  },
  setup(props, context: SetupContext) {
    const vm = getCurrentInstance();
    const lineChart = ref<any>();
    const state: State = reactive({
      accounts: [],
      account: null,
      loading: false,
      graphData: null
    });

    async function getData(onLoad?: boolean) {
      await context.root.$store.dispatch("app/setLoading", true);

      state.accounts = await getService<IAccountService>(
        Types.AccountService
      ).getLatestValues();

      if (onLoad == true) {
        state.account = state.accounts[0].id;
      }

      const history = await getService<IHistoryService>(
        Types.HistoryService
      ).getHistoryForAccount(
        new Date(1970, 11, 0),
        new Date(),
        state.account as number
      );

      const dataset = {
        label: "Total",
        data: history.map(x => x.amount),
        fill: false,
        borderWidth: 5,
        borderColor: "#f57c00"
      };

      state.graphData = {
        labels: history.map(x => format(x.createdAt, "dd.MM.yyyy. HH:mm")),
        datasets: [dataset]
      };

      await context.root.$store.dispatch("app/setLoading", false);
    }

    const graphOptions: GraphOptions = {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false
            }
          }
        ],
        yAxes: [
          {
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              labelString: `${vm?.$t("amount") as string} (HRK)`
            }
          }
        ]
      },
      elements: {
        point: {
          radius: 0
        },
        line: {
          tension: 0.2
        }
      },
      responsive: true
    };

    async function deleteAccount() {
      //
    }

    watch(
      () => context.root.$store.getters["app/refreshTrigger"] as boolean,
      () => {
        getData();
      }
    );

    onMounted(async () => {
      getData(true);
    });

    return {
      state,
      formatCurrencyDisplay,
      graphOptions,
      getData,
      deleteAccount,
      lineChart
    };
  }
});
</script>
