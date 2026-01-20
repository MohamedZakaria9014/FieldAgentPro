package com.fieldagentpro.routesync

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.fieldagentpro.R

class RouteSyncWorker(appContext: Context, workerParams: WorkerParameters) : Worker(appContext, workerParams) {

  override fun doWork(): Result {
    val activeTaskTitles = try {
      queryActiveTasks(applicationContext)
    } catch (e: Exception) {
      emptyList<String>()
    }

    if (activeTaskTitles.isNotEmpty()) {
      val body = activeTaskTitles.joinToString(separator = "\n").take(380)
      showNotification(
        context = applicationContext,
        title = "Active Tasks",
        message = body,
      )
    }

    return Result.success()
  }

  private fun queryActiveTasks(context: Context): List<String> {
    val dbFile = context.getDatabasePath("fieldagentpro.db")
    if (!dbFile.exists()) return emptyList()

    val db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READONLY)
    val titles = mutableListOf<String>()

    db.rawQuery(
      "SELECT order_id, client_company FROM shipments WHERE is_deleted = 0 AND status = 'Active' LIMIT 10",
      null,
    ).use { cursor ->
      val idIndex = cursor.getColumnIndex("order_id")
      val companyIndex = cursor.getColumnIndex("client_company")

      while (cursor.moveToNext()) {
        val id = if (idIndex >= 0) cursor.getInt(idIndex) else 0
        val company = if (companyIndex >= 0) cursor.getString(companyIndex) else ""
        titles.add("Task #$id - $company")
      }
    }

    db.close()
    return titles
  }

  private fun showNotification(context: Context, title: String, message: String) {
    val channelId = "route_sync"

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        channelId,
        "Route Sync",
        NotificationManager.IMPORTANCE_DEFAULT,
      )
      val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      nm.createNotificationChannel(channel)
    }

    val notification = NotificationCompat.Builder(context, channelId)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle(title)
      .setContentText(message)
      .setStyle(NotificationCompat.BigTextStyle().bigText(message))
      .setAutoCancel(true)
      .build()

    NotificationManagerCompat.from(context).notify(9911, notification)
  }
}
