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
      <cv-column>        <cv-tile light>
          <cv-form @submit.prevent="configureModule">            <cv-text-input
              :label="$t('settings.api_key')"
              v-model="apiKey"
              :placeholder="$t('settings.api_key')"
              :disabled="loading.getConfiguration || loading.configureModule"
              :invalid-message="error.apiKey"
              ref="apiKey"
            ></cv-text-input>
            
            <!-- Domain Configuration Section -->
            <cv-accordion>
              <cv-accordion-item>
                <template slot="title">{{ $t('settings.access_configuration') }}</template>
                <template slot="content">
                  <cv-text-input
                    :label="$t('settings.custom_host')"
                    v-model="customHost"
                    :placeholder="'qdrant.mydomain.co.zm'"
                    :disabled="loading.getConfiguration || loading.configureModule"
                    :invalid-message="error.customHost"
                    :helper-text="$t('settings.custom_host_description')"
                  ></cv-text-input>
                  
                  <cv-text-input
                    :label="$t('settings.custom_path')"
                    v-model="customPath"
                    :placeholder="'/qdrant'"
                    :disabled="loading.getConfiguration || loading.configureModule || customHost"
                    :invalid-message="error.customPath"
                    :helper-text="customHost ? $t('settings.custom_path_disabled_for_domain') : $t('settings.custom_path_description')"
                  ></cv-text-input>
                  
                  <cv-toggle
                    v-if="customHost"
                    :label="$t('settings.lets_encrypt')"
                    v-model="letsEncrypt"
                    :disabled="loading.getConfiguration || loading.configureModule"
                  >
                    <template slot="text-left">Disabled</template>
                    <template slot="text-right">Enabled</template>
                  </cv-toggle>
                  <div v-if="customHost" class="bx--form__helper-text">
                    {{ $t('settings.lets_encrypt_description') }}
                  </div>
                </template>
              </cv-accordion-item>
            </cv-accordion>
            
            <cv-toggle
              :label="$t('settings.enable_web_ui')"
              v-model="enableWebUI"
              :disabled="loading.getConfiguration || loading.configureModule"
            >
              <template slot="text-left">Disabled</template>
              <template slot="text-right">Enabled</template>
            </cv-toggle>
            <div class="bx--form__helper-text">
              {{ $t('settings.enable_web_ui_description') }}
            </div>
            
            <cv-toggle
              :label="$t('settings.https_enabled')"
              v-model="httpsEnabled"
              :disabled="loading.getConfiguration || loading.configureModule"
            >
              <template slot="text-left">HTTP</template>
              <template slot="text-right">HTTPS</template>
            </cv-toggle>
            <div class="bx--form__helper-text">
              {{ $t('settings.https_enabled_description') }}
            </div>
            
            <cv-accordion v-if="!loading.getConfiguration && accessUrls.database">
              <cv-accordion-item>
                <template slot="title">{{ $t('settings.access_info') }}</template>
                <template slot="content">
                  <div class="access-info">
                    <div class="access-item">
                      <strong>{{ $t('settings.database_url') }}:</strong>
                      <cv-code-snippet type="single" :copy-feedback="'Copied!'" wrap-text>
                        {{ accessUrls.database }}
                      </cv-code-snippet>
                    </div>
                    <div class="access-item" v-if="enableWebUI">
                      <strong>{{ $t('settings.console_url') }}:</strong>
                      <cv-code-snippet type="single" :copy-feedback="'Copied!'" wrap-text>
                        {{ accessUrls.console }}
                      </cv-code-snippet>
                      <cv-link :href="accessUrls.console" target="_blank">
                        Open Console <Launch16 />
                      </cv-link>
                    </div>
                  </div>
                </template>
              </cv-accordion-item>
            </cv-accordion>
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
  },  data() {
    return {
      q: {
        page: "settings",
      },
      urlCheckInterval: null,      apiKey: "",
      enableWebUI: true,
      httpsEnabled: true,
      customPath: "/qdrant",
      customHost: "",
      letsEncrypt: false,
      loading: {
        getConfiguration: false,
        configureModule: false,
      },      error: {
        getConfiguration: "",
        configureModule: "",
        apiKey: "",
        customPath: "",
        customHost: "",
      },
    };
  },computed: {
    ...mapState(["instanceName", "core", "appName"]),    accessUrls() {
      const protocol = this.httpsEnabled || this.letsEncrypt ? "https" : "http";
      
      if (this.customHost) {
        // Domain-based access
        return {
          database: `${protocol}://${this.customHost}`,
          console: this.enableWebUI ? `${protocol}://${this.customHost}/dashboard` : null
        };
      } else if (this.customPath) {
        // Path-based access
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : "";
        const basePath = this.customPath.startsWith("/") ? this.customPath : `/${this.customPath}`;
        
        return {
          database: `${protocol}://${hostname}${port}${basePath}`,
          console: this.enableWebUI ? `${protocol}://${hostname}${port}${basePath}/dashboard` : null
        };
      }
      
      return {};
    }
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
  methods: {    async getConfiguration() {
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
      this.loading.getConfiguration = false;
      const config = taskResult.output;      this.apiKey = config.ApiKey || "";
      this.enableWebUI = config.EnableWebUI !== undefined ? config.EnableWebUI : true;
      this.httpsEnabled = config.HttpsEnabled !== undefined ? config.HttpsEnabled : true;
      this.customPath = config.CustomPath || "/qdrant";
      this.customHost = config.CustomHost || "";
      this.letsEncrypt = config.LetsEncrypt !== undefined ? config.LetsEncrypt : false;

      // focus first configuration field
      this.focusElement("apiKey");
    },async configureModule() {
      const isValidationOk = this.validateConfigureModule();
      if (!isValidationOk) {
        return;
      }

      this.loading.configureModule = true;
      this.error.configureModule = "";
      this.error.apiKey = "";
      this.error.customPath = "";

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
          action: taskAction,          data: {
            ApiKey: this.apiKey,
            EnableWebUI: this.enableWebUI,
            HttpsEnabled: this.httpsEnabled,
            CustomPath: this.customPath,
            CustomHost: this.customHost,
            LetsEncrypt: this.letsEncrypt,
          },
          extra: {
            title: this.$t("settings.configure_instance", {
              instance: this.instanceName,
            }),
            description: this.$t("common.processing"),
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
    },    configureModuleValidationFailed(validationErrors) {
      this.loading.configureModule = false;
      let focusAlreadySet = false;

      for (const validationError of validationErrors) {
        const field = validationError.field;

        if (field !== "(root)") {
          // set i18n error message
          this.error[field] = this.$t("settings." + validationError.error);

          if (!focusAlreadySet) {
            this.focusElement(field);
            focusAlreadySet = true;
          }
        }
      }
    },    validateConfigureModule() {
      this.clearErrors(this);
      let isValidationOk = true;

      // Validate API key (optional but show warning)
      if (!this.apiKey) {
        // API key is optional but recommended
        console.warn("API key is not set - database will be accessible without authentication");
      }

      // Validate custom host if provided
      if (this.customHost) {
        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
        if (!domainRegex.test(this.customHost)) {
          this.error.customHost = this.$t("settings.invalid_domain");
          if (isValidationOk) {
            this.focusElement("customHost");
            isValidationOk = false;
          }
        }
      } else {
        // Validate custom path only if no custom host is provided
        if (!this.customPath || !this.customPath.startsWith("/")) {
          this.error.customPath = this.$t("common.required") + " - Path must start with /";
          if (isValidationOk) {
            this.focusElement("customPath");
            isValidationOk = false;
          }
        }
      }

      return isValidationOk;
    },
    configureModuleCompleted() {
      this.loading.configureModule = false;

      // reload configuration
      this.getConfiguration();
    },
  },
};
</script>

<style scoped lang="scss">
@import "../styles/carbon-utils";

.access-info {
  margin-top: 1rem;
}

.access-item {
  margin-bottom: 1rem;
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .bx--link {
    margin-top: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
}

.bx--form__helper-text {
  margin-bottom: 1rem;
}
</style>
