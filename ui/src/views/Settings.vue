<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <cv-grid fullWidth>
    <cv-row>
      <cv-column class="page-title">
        <h2>{{ $t("settings.title") }}</h2>
      </cv-column>
    </cv-row>
    <cv-row v-if="error.getConfiguration">
      <cv-column>
        <NsInlineNotification
          kind="error"
          :title="$t('action.get-configuration')"
          :description="error.getConfiguration"
          :showCloseButton="false"
        />
      </cv-column>
    </cv-row>
    <cv-row>
      <cv-column>
        <cv-tile light>
          <cv-form @submit.prevent="configureModule">
            <cv-text-input
              :label="$t('settings.host')"
              v-model="host"
              placeholder="qdrant.mydomain.org"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="$t(error.host)"
              ref="host"
            ></cv-text-input>
            <cv-text-input
              :label="$t('settings.path')"
              v-model="path"
              placeholder="/qdrant"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="$t(error.path)"
              :helper-text="$t('settings.path_helper')"
              ref="path"
            ></cv-text-input>
            <cv-text-input
              :label="$t('settings.port')"
              v-model="port"
              type="number"
              placeholder="6333"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="$t(error.port)"
              ref="port"
            ></cv-text-input>
            <cv-text-input
              :label="$t('settings.api_key')"
              v-model="api_key"
              type="password"
              :placeholder="$t('settings.api_key_placeholder')"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="$t(error.api_key)"
              :helper-text="$t('settings.api_key_helper')"
              ref="api_key"
            ></cv-text-input>
            <cv-toggle
              value="letsEncrypt"
              :label="$t('settings.lets_encrypt')"
              v-model="lets_encrypt"
              :disabled="loading.getConfiguration || loading.configureModule"
              class="mg-bottom"
            >
              <template slot="text-left">{{
                $t("settings.disabled")
              }}</template>
              <template slot="text-right">{{
                $t("settings.enabled")
              }}</template>
            </cv-toggle>
            <cv-toggle
              v-if="lets_encrypt"
              value="http2https"
              :label="$t('settings.http2https')"
              v-model="http2https"
              :disabled="loading.getConfiguration || loading.configureModule"
              class="mg-bottom"
            >
              <template slot="text-left">{{
                $t("settings.disabled")
              }}</template>
              <template slot="text-right">{{
                $t("settings.enabled")
              }}</template>
            </cv-toggle>
            <cv-accordion ref="accordion">
              <cv-accordion-item :open="toggleAccordion[0]">
                <template slot="title">{{ $t("common.advanced") }}</template>
                <template slot="content">
                  <cv-text-input
                    :label="$t('settings.collection_size_limit')"
                    v-model="collection_size_limit"
                    type="number"
                    :helper-text="$t('settings.collection_size_limit_helper')"
                    :invalid-message="$t(error.collection_size_limit)"
                    :disabled="loading.getConfiguration || loading.configureModule"
                    ref="collection_size_limit"
                  >
                  </cv-text-input>
                  <cv-toggle
                    value="enableCors"
                    :label="$t('settings.enable_cors')"
                    v-model="enable_cors"
                    :disabled="loading.getConfiguration || loading.configureModule"
                    class="mg-bottom"
                  >
                    <template slot="text-left">{{
                      $t("settings.disabled")
                    }}</template>
                    <template slot="text-right">{{
                      $t("settings.enabled")
                    }}</template>
                  </cv-toggle>
                </template>
              </cv-accordion-item>
            </cv-accordion>
            <br />
            <cv-row v-if="error.configureModule">
              <cv-column>
                <NsInlineNotification
                  kind="error"
                  :title="$t('action.configure-module')"
                  :description="error.configureModule"
                  :showCloseButton="false"
                />
              </cv-column>
            </cv-row>
            <cv-row v-if="error.testConnection">
              <cv-column>
                <NsInlineNotification
                  kind="error"
                  :title="$t('settings.test_connection')"
                  :description="error.testConnection"
                  :showCloseButton="false"
                />
              </cv-column>
            </cv-row>
            <NsButton
              kind="secondary"
              :icon="TestTube20"
              :loading="loading.testConnection"
              :disabled="loading.getConfiguration || loading.configureModule"
              @click="testConnection"
              class="mg-right"
              >{{ $t("settings.test_connection") }}</NsButton
            >
            <NsButton
              kind="primary"
              :icon="Save20"
              :loading="loading.configureModule"
              :disabled="loading.getConfiguration || loading.configureModule"
              >{{ $t("settings.save") }}</NsButton
            >
          </cv-form>
        </cv-tile>
      </cv-column>
    </cv-row>
  </cv-grid>
</template>

<script>
import to from "await-to-js";
import { mapState } from "vuex";
import {
  QueryParamService,
  UtilService,
  TaskService,
  IconService,
  PageTitleService,
} from "@nethserver/ns8-ui-lib";

export default {
  name: "Settings",
  mixins: [
    TaskService,
    IconService,
    UtilService,
    QueryParamService,
    PageTitleService,
  ],
  pageTitle() {
    return this.$t("settings.title") + " - " + this.appName;
  },
  data() {
    return {
      q: {
        page: "settings",
      },
      urlCheckInterval: null,
      host: "",
      path: "",
      port: 6333,
      api_key: "",
      lets_encrypt: false,
      http2https: false,
      collection_size_limit: 10000,
      enable_cors: true,
      toggleAccordion: [false],
      loading: {
        getConfiguration: false,
        configureModule: false,
        testConnection: false,
      },
      error: {
        getConfiguration: "",
        configureModule: "",
        testConnection: "",
        host: "",
        path: "",
        port: "",
        api_key: "",
        collection_size_limit: "",
      },
    };
  },
  computed: {
    ...mapState(["instanceName", "core", "appName"]),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.watchQueryData(vm);
      vm.urlCheckInterval = vm.initUrlBindingForApp(vm, vm.q.page);
    });
  },
  beforeRouteLeave(to, from, next) {
    clearInterval(this.urlCheckInterval);
    next();
  },
  created() {
    this.getConfiguration();
  },
  methods: {
    async getConfiguration() {
      this.loading.getConfiguration = true;
      this.error.getConfiguration = "";
      const taskAction = "get-configuration";
      const eventId = this.getUuid();

      // register to task error
      this.core.$root.$once(
        `${taskAction}-aborted-${eventId}`,
        this.getConfigurationAborted
      );

      // register to task completion
      this.core.$root.$once(
        `${taskAction}-completed-${eventId}`,
        this.getConfigurationCompleted
      );

      const res = await to(
        this.createModuleTaskForApp(this.instanceName, {
          action: taskAction,
          extra: {
            title: this.$t("action." + taskAction),
            isNotificationHidden: true,
            eventId,
          },
        })
      );
      const err = res[0];

      if (err) {
        console.error(`error creating task ${taskAction}`, err);
        this.error.getConfiguration = this.getErrorMessage(err);
        this.loading.getConfiguration = false;
        return;
      }
    },
    getConfigurationAborted(taskResult, taskContext) {
      console.error(`${taskContext.action} aborted`, taskResult);
      this.error.getConfiguration = this.$t("error.generic_error");
      this.loading.getConfiguration = false;
    },
    getConfigurationCompleted(taskContext, taskResult) {
      const config = taskResult.output;
      this.loading.getConfiguration = false;

      // Populate form fields
      this.host = config.host || "";
      this.path = config.path || "";
      this.port = config.port || 6333;
      this.api_key = config.api_key || "";
      this.lets_encrypt = config.lets_encrypt || false;
      this.http2https = config.http2https || false;
      this.collection_size_limit = config.collection_size_limit || 10000;
      this.enable_cors = config.enable_cors !== undefined ? config.enable_cors : true;

      this.focusElement("host");
    },
    validateConfigureModule() {
      this.clearErrors(this);
      let isValidationOk = true;

      if (!this.host) {
        this.error.host = "common.required";
        if (isValidationOk) {
          this.focusElement("host");
        }
        isValidationOk = false;
      }

      if (this.port < 1 || this.port > 65535) {
        this.error.port = "settings.invalid_port";
        if (isValidationOk) {
          this.focusElement("port");
        }
        isValidationOk = false;
      }

      if (this.collection_size_limit < 0) {
        this.error.collection_size_limit = "settings.invalid_collection_size_limit";
        if (isValidationOk) {
          this.focusElement("collection_size_limit");
        }
        isValidationOk = false;
      }

      return isValidationOk;
    },
    configureModuleValidationFailed(validationErrors) {
      this.loading.configureModule = false;
      let focusAlreadySet = false;

      for (const validationError of validationErrors) {
        const param = validationError.parameter;
        // set i18n error message
        this.error[param] = this.$t("settings." + validationError.error);

        if (!focusAlreadySet) {
          this.focusElement(param);
          focusAlreadySet = true;
        }
      }
    },
    async configureModule() {
      this.error.testConnection = "";
      const isValidationOk = this.validateConfigureModule();
      if (!isValidationOk) {
        return;
      }

      this.loading.configureModule = true;
      const taskAction = "configure-module";
      const eventId = this.getUuid();

      // register to task error
      this.core.$root.$once(
        `${taskAction}-aborted-${eventId}`,
        this.configureModuleAborted
      );

      // register to task validation
      this.core.$root.$once(
        `${taskAction}-validation-failed-${eventId}`,
        this.configureModuleValidationFailed
      );

      // register to task completion
      this.core.$root.$once(
        `${taskAction}-completed-${eventId}`,
        this.configureModuleCompleted
      );

      const res = await to(
        this.createModuleTaskForApp(this.instanceName, {
          action: taskAction,
          data: {
            host: this.host,
            path: this.path,
            lets_encrypt: this.lets_encrypt,
            http2https: this.http2https,
            port: parseInt(this.port),
            api_key: this.api_key,
            collection_size_limit: parseInt(this.collection_size_limit),
            enable_cors: this.enable_cors,
          },
          extra: {
            title: this.$t("settings.instance_configuration", {
              instance: this.instanceName,
            }),
            description: this.$t("settings.configuring"),
            eventId,
          },
        })
      );
      const err = res[0];

      if (err) {
        console.error(`error creating task ${taskAction}`, err);
        this.error.configureModule = this.getErrorMessage(err);
        this.loading.configureModule = false;
        return;
      }
    },
    configureModuleAborted(taskResult, taskContext) {
      console.error(`${taskContext.action} aborted`, taskResult);
      this.error.configureModule = this.$t("error.generic_error");
      this.loading.configureModule = false;
    },
    configureModuleCompleted() {
      this.loading.configureModule = false;
      // reload configuration
      this.getConfiguration();
    },
    async testConnection() {
      this.error.testConnection = "";
      const isValidationOk = this.validateConfigureModule();
      if (!isValidationOk) {
        return;
      }

      this.loading.testConnection = true;
      const taskAction = "test-connection";
      const eventId = this.getUuid();

      // register to task error
      this.core.$root.$once(
        `${taskAction}-aborted-${eventId}`,
        this.testConnectionAborted
      );

      // register to task completion
      this.core.$root.$once(
        `${taskAction}-completed-${eventId}`,
        this.testConnectionCompleted
      );

      const res = await to(
        this.createModuleTaskForApp(this.instanceName, {
          action: taskAction,
          data: {
            host: this.host,
            path: this.path,
            port: parseInt(this.port),
            api_key: this.api_key,
          },
          extra: {
            title: this.$t("settings.test_connection"),
            isNotificationHidden: true,
            eventId,
          },
        })
      );
      const err = res[0];

      if (err) {
        console.error(`error creating task ${taskAction}`, err);
        this.error.testConnection = this.getErrorMessage(err);
        this.loading.testConnection = false;
        return;
      }
    },
    testConnectionAborted(taskResult, taskContext) {
      console.error(`${taskContext.action} aborted`, taskResult);
      this.error.testConnection = this.$t("error.generic_error");
      this.loading.testConnection = false;
    },
    testConnectionCompleted(taskContext, taskResult) {
      this.loading.testConnection = false;
      const result = taskResult.output;
      
      if (result.success) {
        this.createSuccessNotificationForApp({
          title: this.$t("settings.test_connection_success"),
          description: result.version 
            ? this.$t("settings.version_detected", { version: result.version })
            : this.$t("settings.connection_successful"),
        });
      } else {
        this.error.testConnection = result.error || this.$t("settings.connection_failed");
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../styles/carbon-utils";
.mg-bottom {
  margin-bottom: $spacing-06;
}
.mg-right {
  margin-right: $spacing-05;
}
</style>
