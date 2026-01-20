package com.fieldagentpro.routesync

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class RouteSyncModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "RouteSync"

  @ReactMethod
  fun schedulePeriodic(promise: Promise) {
    try {
      val request = PeriodicWorkRequestBuilder<RouteSyncWorker>(60, TimeUnit.MINUTES).build()
      WorkManager.getInstance(reactApplicationContext)
        .enqueueUniquePeriodicWork("RouteSync", ExistingPeriodicWorkPolicy.UPDATE, request)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("schedule_failed", e)
    }
  }

  @ReactMethod
  fun runOnceNow(promise: Promise) {
    try {
      val request = OneTimeWorkRequestBuilder<RouteSyncWorker>().build()
      WorkManager.getInstance(reactApplicationContext)
        .enqueueUniqueWork("RouteSyncOnce", ExistingWorkPolicy.REPLACE, request)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("run_failed", e)
    }
  }
}
