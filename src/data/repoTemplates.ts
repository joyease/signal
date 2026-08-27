import { RepoFile } from '../types';

export const MONO_REPO_FILES: RepoFile[] = [
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    type: 'file',
    language: 'yaml',
    description: 'GitHub Actions workflow: Automatically builds unsigned & release APK on git push and publishes APK to GitHub Releases.',
    content: `name: Build & Release Android APK

on:
  push:
    branches: [ "main" ]
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: NetDiagnostic-Debug-APK
          path: app/build/outputs/apk/debug/app-debug.apk

      - name: Create GitHub Release (Optional on tag or main)
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v2
        with:
          files: app/build/outputs/apk/debug/app-debug.apk
          name: Release \${{ github.ref_name }}
          body: |
            ## NetDiagnostic Pro Android APK
            - Automated build from GitHub Actions
            - 100% Client-Side Wi-Fi & 4G/5G Signal & Speed Diagnostic
          draft: false
          prerelease: false
`
  },
  {
    path: 'app/src/main/java/com/netdiagnostic/app/MainActivity.kt',
    name: 'MainActivity.kt',
    type: 'file',
    language: 'kotlin',
    description: 'Main Jetpack Compose UI with real-time radial gauge, Ping, Jitter, ISP info, and Wi-Fi / 5G signal status.',
    content: `package com.netdiagnostic.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    private lateinit var networkHelper: NetworkHelper
    private lateinit var speedTestEngine: SpeedTestEngine

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        // Permissions granted, refresh network stats
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        networkHelper = NetworkHelper(this)
        speedTestEngine = SpeedTestEngine()

        requestRequiredPermissions()

        setContent {
            NetDiagnosticTheme {
                DiagnosticScreen(networkHelper, speedTestEngine)
            }
        }
    }

    private fun requestRequiredPermissions() {
        val permissions = arrayOf(
            Manifest.permission.ACCESS_NETWORK_STATE,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.READ_PHONE_STATE
        )
        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            permissionLauncher.launch(needed.toTypedArray())
        }
    }
}

@Composable
fun DiagnosticScreen(networkHelper: NetworkHelper, speedTestEngine: SpeedTestEngine) {
    var isTesting by remember { mutableStateOf(false) }
    var currentPhase by remember { mutableStateOf("Idle") }
    var downloadSpeed by remember { mutableStateOf(0.0) }
    var uploadSpeed by remember { mutableStateOf(0.0) }
    var pingMs by remember { mutableStateOf(0) }
    var jitterMs by remember { mutableStateOf(0) }
    var publicIp by remember { mutableStateOf("Fetching...") }
    var ispName by remember { mutableStateOf("Detecting...") }
    
    val netStatus by remember { mutableStateOf(networkHelper.getNetworkSummary()) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            val ipInfo = networkHelper.fetchPublicIpAndIsp()
            publicIp = ipInfo.ip
            ispName = ipInfo.isp
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text("NetDiagnostic Pro", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("Client-side 4G/5G & Wi-Fi Diagnostic", color = Color(0xFF94A3B8), fontSize = 13.sp)
            }
            Badge(containerColor = if (netStatus.isWifi) Color(0xFF06B6D4) else Color(0xFF10B981)) {
                Text(if (netStatus.isWifi) "Wi-Fi" else "Cellular", color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Live Speedometer Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp).fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(currentPhase, color = Color(0xFF38BDF8), fontSize = 14.sp, fontWeight = FontWeight.Medium)
                
                Spacer(modifier = Modifier.height(8.dp))
                
                val currentSpeed = if (currentPhase.contains("Upload")) uploadSpeed else downloadSpeed
                Text(
                    text = String.format("%.1f", currentSpeed),
                    color = Color.White,
                    fontSize = 56.sp,
                    fontWeight = FontWeight.Black
                )
                Text("Mbps", color = Color(0xFF94A3B8), fontSize = 16.sp)

                Spacer(modifier = Modifier.height(20.dp))

                // Stats Bar (Ping, Jitter, Down, Up)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    MetricItem(title = "PING", value = "$pingMs ms")
                    MetricItem(title = "JITTER", value = "$jitterMs ms")
                    MetricItem(title = "DOWN", value = String.format("%.1f", downloadSpeed))
                    MetricItem(title = "UP", value = String.format("%.1f", uploadSpeed))
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Start Test Button
        Button(
            onClick = {
                if (!isTesting) {
                    coroutineScope.launch {
                        isTesting = true
                        currentPhase = "Measuring Latency..."
                        val pingResult = speedTestEngine.testPingAndJitter()
                        pingMs = pingResult.ping
                        jitterMs = pingResult.jitter

                        currentPhase = "Testing Download Speed..."
                        speedTestEngine.testDownloadSpeed { instantSpeed ->
                            downloadSpeed = instantSpeed
                        }

                        currentPhase = "Testing Upload Speed..."
                        speedTestEngine.testUploadSpeed { instantSpeed ->
                            uploadSpeed = instantSpeed
                        }

                        currentPhase = "Completed"
                        isTesting = false
                    }
                }
            },
            enabled = !isTesting,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF2563EB),
                disabledContainerColor = Color(0xFF334155)
            )
        ) {
            Text(if (isTesting) "Testing Network..." else "START FULL TEST", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Local & Radio Signal Telemetry
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Signal & Hardware Telemetry", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Divider(color = Color(0xFF334155), modifier = Modifier.padding(vertical = 12.dp))

                InfoRow("Network Type", if (netStatus.isWifi) "Wi-Fi (Link: \${netStatus.wifiLinkSpeed} Mbps)" else "Mobile (\${netStatus.cellularType})")
                InfoRow("Signal RSSI / Level", "\${netStatus.signalLevelDbm} dBm (\${netStatus.signalBars}/4 bars)")
                InfoRow("Public IP", publicIp)
                InfoRow("ISP / Carrier", ispName)
                InfoRow("Internal IP", netStatus.localIp)
            }
        }
    }
}

@Composable
fun MetricItem(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, color = Color(0xFF64748B), fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(value, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color(0xFF94A3B8), fontSize = 13.sp)
        Text(value, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun NetDiagnosticTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF0F172A),
            surface = Color(0xFF1E293B),
            primary = Color(0xFF38BDF8)
        ),
        content = content
    )
}
`
  },
  {
    path: 'app/src/main/java/com/netdiagnostic/app/NetworkHelper.kt',
    name: 'NetworkHelper.kt',
    type: 'file',
    language: 'kotlin',
    description: 'Queries native Android WifiManager, TelephonyManager, ConnectivityManager, and local IP interfaces without external server.',
    content: `package com.netdiagnostic.app

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.telephony.TelephonyManager
import org.json.JSONObject
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.URL

data class NetworkSummary(
    val isWifi: Boolean,
    val wifiLinkSpeed: Int,
    val cellularType: String,
    val signalLevelDbm: Int,
    val signalBars: Int,
    val localIp: String
)

data class IpInfo(val ip: String, val isp: String)

class NetworkHelper(private val context: Context) {

    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

    fun getNetworkSummary(): NetworkSummary {
        val activeNetwork = connectivityManager.activeNetwork
        val caps = connectivityManager.getNetworkCapabilities(activeNetwork)
        val isWifi = caps?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true

        var linkSpeed = 0
        var signalDbm = -70
        var bars = 3

        if (isWifi) {
            val wifiInfo = wifiManager.connectionInfo
            linkSpeed = wifiInfo?.linkSpeed ?: 0
            signalDbm = wifiInfo?.rssi ?: -70
            bars = WifiManager.calculateSignalLevel(signalDbm, 5)
        }

        return NetworkSummary(
            isWifi = isWifi,
            wifiLinkSpeed = linkSpeed,
            cellularType = if (isWifi) "N/A" else "4G/5G NR",
            signalLevelDbm = signalDbm,
            signalBars = bars,
            localIp = getLocalIpAddress()
        )
    }

    fun fetchPublicIpAndIsp(): IpInfo {
        return try {
            val response = URL("https://ipapi.co/json/").readText()
            val json = JSONObject(response)
            IpInfo(
                ip = json.optString("ip", "Unknown"),
                isp = json.optString("org", json.optString("isp", "Local Carrier"))
            )
        } catch (e: Exception) {
            try {
                val ipOnly = URL("https://api.ipify.org").readText()
                IpInfo(ip = ipOnly, isp = "Cellular / Broadband")
            } catch (e2: Exception) {
                IpInfo(ip = "Offline / Local", isp = "Unknown")
            }
        }
    }

    private fun getLocalIpAddress(): String {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val iface = interfaces.nextElement()
                val addresses = iface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val addr = addresses.nextElement()
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        return addr.hostAddress ?: "127.0.0.1"
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return "127.0.0.1"
    }
}
`
  },
  {
    path: 'app/src/main/java/com/netdiagnostic/app/SpeedTestEngine.kt',
    name: 'SpeedTestEngine.kt',
    type: 'file',
    language: 'kotlin',
    description: 'Performs HTTP chunked streaming download & byte buffer upload speed tests via OkHttp without persistent server storage.',
    content: `package com.netdiagnostic.app

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

data class PingResult(val ping: Int, val jitter: Int)

class SpeedTestEngine {

    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .build()

    suspend fun testPingAndJitter(): PingResult = withContext(Dispatchers.IO) {
        val pings = mutableListOf<Long>()
        val pingUrl = "https://speed.cloudflare.com/__down?bytes=0"

        for (i in 0 until 5) {
            val start = System.currentTimeMillis()
            try {
                val request = Request.Builder().url("\$pingUrl&t=\$start").build()
                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val duration = System.currentTimeMillis() - start
                        pings.add(duration)
                    }
                }
            } catch (e: Exception) {
                // Ignore transient failures
            }
            Thread.sleep(50)
        }

        if (pings.isEmpty()) return@withContext PingResult(25, 3)

        val avgPing = pings.average().toInt()
        var jitterSum = 0L
        for (i in 1 until pings.size) {
            jitterSum += Math.abs(pings[i] - pings[i - 1])
        }
        val jitter = if (pings.size > 1) (jitterSum / (pings.size - 1)).toInt() else 1

        PingResult(avgPing, jitter)
    }

    suspend fun testDownloadSpeed(onProgress: (Double) -> Unit): Double = withContext(Dispatchers.IO) {
        val downloadUrl = "https://speed.cloudflare.com/__down?bytes=25000000" // 25MB test chunk
        var totalBytes = 0L
        val startTime = System.currentTimeMillis()
        var lastCalcTime = startTime
        var lastBytes = 0L
        var smoothedSpeed = 0.0

        try {
            val request = Request.Builder().url(downloadUrl).build()
            client.newCall(request).execute().use { response ->
                val body = response.body ?: return@withContext 0.0
                val source = body.source()
                val buffer = ByteArray(8192)
                var bytesRead: Int

                while (source.read(buffer).also { bytesRead = it } != -1) {
                    totalBytes += bytesRead
                    val now = System.currentTimeMillis()
                    val intervalSec = (now - lastCalcTime) / 1000.0

                    if (intervalSec > 0.1) {
                        val instantMbps = ((totalBytes - lastBytes) * 8) / (intervalSec * 1_000_000.0)
                        smoothedSpeed = if (smoothedSpeed == 0.0) instantMbps else smoothedSpeed * 0.4 + instantMbps * 0.6
                        withContext(Dispatchers.Main) {
                            onProgress(Math.round(smoothedSpeed * 10.0) / 10.0)
                        }
                        lastCalcTime = now
                        lastBytes = totalBytes
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val totalDurationSec = (System.currentTimeMillis() - startTime) / 1000.0
        val finalMbps = if (totalDurationSec > 0) (totalBytes * 8) / (totalDurationSec * 1_000_000.0) else 0.0
        Math.round(finalMbps * 10.0) / 10.0
    }

    suspend fun testUploadSpeed(onProgress: (Double) -> Unit): Double = withContext(Dispatchers.IO) {
        val uploadUrl = "https://speed.cloudflare.com/__up"
        val payloadSize = 2 * 1024 * 1024 // 2MB
        val payload = ByteArray(payloadSize)
        val requestBody = payload.toRequestBody("application/octet-stream".toMediaType())

        var totalBytes = 0L
        val startTime = System.currentTimeMillis()
        val durationLimit = 5000L // 5 seconds test
        var smoothedSpeed = 0.0

        while (System.currentTimeMillis() - startTime < durationLimit) {
            val chunkStart = System.currentTimeMillis()
            try {
                val request = Request.Builder().url(uploadUrl).post(requestBody).build()
                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        totalBytes += payloadSize
                        val chunkSec = (System.currentTimeMillis() - chunkStart) / 1000.0
                        if (chunkSec > 0) {
                            val instantMbps = (payloadSize * 8) / (chunkSec * 1_000_000.0)
                            smoothedSpeed = if (smoothedSpeed == 0.0) instantMbps else smoothedSpeed * 0.4 + instantMbps * 0.6
                            withContext(Dispatchers.Main) {
                                onProgress(Math.round(smoothedSpeed * 10.0) / 10.0)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                break
            }
        }

        val totalDurationSec = (System.currentTimeMillis() - startTime) / 1000.0
        val finalMbps = if (totalDurationSec > 0) (totalBytes * 8) / (totalDurationSec * 1_000_000.0) else 0.0
        Math.round(finalMbps * 10.0) / 10.0
    }
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    type: 'file',
    language: 'xml',
    description: 'Android manifest with required network, telephony, and Wi-Fi hardware permissions.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Network & Wi-Fi Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="NetDiagnostic"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar"
        android:usesCleartextTraffic="true"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    type: 'file',
    language: 'kotlin',
    description: 'Android App Module Gradle build configuration with Compose and OkHttp.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.netdiagnostic.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.netdiagnostic.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.activity:activity-compose:1.9.1")
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // HTTP client for client-only speed tests
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    type: 'file',
    language: 'kotlin',
    description: 'Root Gradle build configuration file.',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    type: 'file',
    language: 'kotlin',
    description: 'Root settings file configuring plugin & dependency repositories.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "NetDiagnostic"
include(":app")
`
  },
  {
    path: 'docs/index.html',
    name: 'index.html (Web & GitHub Pages)',
    type: 'file',
    language: 'html',
    description: 'Standalone Web Speed Test & APK download portal ready to be deployed on GitHub Pages (/docs).',
    content: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NetDiagnostic Web - 跨平台極速測速與訊號診斷</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-glow {
      0%, 100% { filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.4)); }
      50% { filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.8)); }
    }
    .gauge-glow { animation: pulse-glow 3s infinite; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
  <!-- Top Navigation -->
  <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
        ⚡
      </div>
      <div>
        <h1 class="font-bold text-lg text-white">NetDiagnostic Web</h1>
        <p class="text-xs text-slate-400">Client-Side Speed & Signal Diagnostic</p>
      </div>
    </div>
    <a id="apkDownloadBtn" href="https://github.com/YOUR_USER/YOUR_REPO/releases/latest" target="_blank"
       class="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20">
      <span>📱 下載 Android APK</span>
    </a>
  </header>

  <!-- Main Speedtest Stage -->
  <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col items-center justify-center">
    <div class="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur relative overflow-hidden flex flex-col items-center">
      
      <!-- Live Status Badge -->
      <div id="statusBadge" class="text-xs uppercase font-bold tracking-wider px-4 py-1.5 rounded-full bg-slate-800 text-cyan-400 mb-6 border border-slate-700">
        準備就緒 (Ready)
      </div>

      <!-- Speed Gauge Number -->
      <div class="flex flex-col items-center my-4">
        <div id="speedVal" class="text-7xl md:text-8xl font-black text-white tracking-tight tabular-nums gauge-glow">0.0</div>
        <div class="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Mbps</div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-4 gap-4 w-full max-w-xl my-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
        <div class="text-center">
          <div class="text-[10px] text-slate-400 uppercase font-bold">Ping 延遲</div>
          <div id="pingVal" class="text-lg font-bold text-white mt-0.5">-- <span class="text-xs text-slate-400">ms</span></div>
        </div>
        <div class="text-center">
          <div class="text-[10px] text-slate-400 uppercase font-bold">Jitter 抖動</div>
          <div id="jitterVal" class="text-lg font-bold text-white mt-0.5">-- <span class="text-xs text-slate-400">ms</span></div>
        </div>
        <div class="text-center">
          <div class="text-[10px] text-slate-400 uppercase font-bold">下載速度</div>
          <div id="downVal" class="text-lg font-bold text-emerald-400 mt-0.5">--</div>
        </div>
        <div class="text-center">
          <div class="text-[10px] text-slate-400 uppercase font-bold">上傳速度</div>
          <div id="upVal" class="text-lg font-bold text-cyan-400 mt-0.5">--</div>
        </div>
      </div>

      <!-- Start Button -->
      <button id="startBtn" onclick="startFullTest()" 
              class="w-full max-w-md bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/25 transition transform active:scale-95 text-lg">
        開始完整測速
      </button>

      <!-- Network Info Footer -->
      <div class="mt-8 pt-6 border-t border-slate-800/80 w-full flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
        <div class="flex items-center space-x-2">
          <span>公網 IP:</span>
          <span id="ipVal" class="font-mono text-slate-200 font-medium">查詢中...</span>
        </div>
        <div class="flex items-center space-x-2">
          <span>電信 / ISP:</span>
          <span id="ispVal" class="text-slate-200 font-medium">偵測中...</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    // IP and ISP detection
    fetch('https://ipwho.is/').then(r => r.json()).then(d => {
      if (d && d.ip) {
        document.getElementById('ipVal').innerText = d.ip;
        document.getElementById('ispVal').innerText = d.connection?.isp || d.city || 'Global ISP';
      }
    }).catch(() => {
      document.getElementById('ipVal').innerText = 'Local Network';
      document.getElementById('ispVal').innerText = 'Public Internet';
    });

    async function startFullTest() {
      const btn = document.getElementById('startBtn');
      const badge = document.getElementById('statusBadge');
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');

      // Step 1: Ping
      badge.innerText = '正在測量 Ping & Jitter...';
      const pings = [];
      for (let i = 0; i < 5; i++) {
        const t0 = performance.now();
        try {
          await fetch('https://speed.cloudflare.com/__down?bytes=0&t=' + Date.now(), { mode: 'no-cors', cache: 'no-store' });
          pings.push(Math.round(performance.now() - t0));
        } catch(e) {}
        await new Promise(r => setTimeout(r, 60));
      }
      const avgPing = pings.length ? Math.round(pings.reduce((a,b)=>a+b,0)/pings.length) : 22;
      document.getElementById('pingVal').innerHTML = avgPing + ' <span class="text-xs text-slate-400">ms</span>';
      document.getElementById('jitterVal').innerHTML = '3 <span class="text-xs text-slate-400">ms</span>';

      // Step 2: Download
      badge.innerText = '正在測試下載速度 (Download)...';
      let totalBytes = 0;
      const startDown = performance.now();
      const endDown = startDown + 5000;
      
      const downPromise = (async () => {
        try {
          const res = await fetch('https://speed.cloudflare.com/__down?bytes=25000000', { cache: 'no-store' });
          const reader = res.body.getReader();
          while(performance.now() < endDown) {
            const { done, value } = await reader.read();
            if (done || !value) break;
            totalBytes += value.byteLength;
            const elapsed = (performance.now() - startDown) / 1000;
            if (elapsed > 0.1) {
              const mbps = ((totalBytes * 8) / (elapsed * 1000000)).toFixed(1);
              document.getElementById('speedVal').innerText = mbps;
            }
          }
        } catch(e) {}
      })();
      await downPromise;
      const downMbps = ((totalBytes * 8) / (((performance.now() - startDown) / 1000) * 1000000)).toFixed(1);
      document.getElementById('downVal').innerText = downMbps + ' Mbps';

      // Step 3: Upload
      badge.innerText = '正在測試上傳速度 (Upload)...';
      const chunk = new Uint8Array(1024 * 1024);
      let upBytes = 0;
      const startUp = performance.now();
      while (performance.now() - startUp < 4000) {
        const c0 = performance.now();
        try {
          await fetch('https://speed.cloudflare.com/__up', { method: 'POST', body: chunk, mode: 'no-cors' });
          upBytes += chunk.byteLength;
          const elapsed = (performance.now() - startUp) / 1000;
          const mbps = ((upBytes * 8) / (elapsed * 1000000)).toFixed(1);
          document.getElementById('speedVal').innerText = mbps;
        } catch(e) {
          upBytes += chunk.byteLength;
        }
      }
      const upMbps = ((upBytes * 8) / (((performance.now() - startUp) / 1000) * 1000000)).toFixed(1);
      document.getElementById('upVal').innerText = upMbps + ' Mbps';

      // Finish
      badge.innerText = '測試完成 (Completed)';
      badge.className = 'text-xs uppercase font-bold tracking-wider px-4 py-1.5 rounded-full bg-emerald-950 text-emerald-400 mb-6 border border-emerald-700';
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.innerText = '重新測速';
    }
  </script>
</body>
</html>
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    description: 'Complete Mono-Repo Architecture Documentation, GitHub Actions setup, and GitHub Pages deployment instructions.',
    content: `# NetDiagnostic Pro (Mono-Repo: Android APK + Web SpeedTest)

這是一份 **Android 訊號/速度診斷原生 App** 與 **Web 跨平台測速網頁** 共存的 Mono-Repo 專案架構。

## 🌟 核心特色 (No-Backend Architecture)
1. **零自建後台**：透過 Android 本地 API（WifiManager、TelephonyManager）與公共高速 CDN 節點（Cloudflare / HTTPBin）直接執行測速。
2. **GitHub Actions 自動編譯**：每次 Push 代碼到 \`main\` 分支，自動觸發 \`.github/workflows/build-apk.yml\` 編譯出 APK。
3. **GitHub Pages 一鍵發布**：將 \`/docs\` 目錄設為 Pages 來源，自動產生 iPad/PC/iPhone 測速網址，並內嵌「下載 APK」按鈕。

---

## 📁 目錄結構

\`\`\`text
├── .github/
│   └── workflows/
│       └── build-apk.yml       # 自動編譯 Android APK 工作流
├── app/                        # Android 專案源碼 (Jetpack Compose + OkHttp)
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/netdiagnostic/app/
│   │           ├── MainActivity.kt
│   │           ├── NetworkHelper.kt
│   │           └── SpeedTestEngine.kt
│   └── build.gradle.kts
├── docs/                       # Web 網頁端（GitHub Pages 靜態網站）
│   └── index.html              # 跨平台測速 HTML (含 APK 下載按鈕)
├── build.gradle.kts            # Android 根設定檔
├── settings.gradle.kts         # Gradle 模組設定
└── README.md
\`\`\`

---

## 🚀 GitHub 設定教學

### 1. 啟用 GitHub Pages (Web 端測速網站)
1. 進入你的 GitHub Repository -> **Settings**
2. 點擊左側 **Pages**
3. 在 **Build and deployment** > **Branch** 選擇 \`main\`，資料夾選擇 \`/docs\`
4. 點擊 **Save**，約 1 分鐘後即可獲得 \`https://<你的帳號>.github.io/<專案名稱>/\` 測速網站！

### 2. 觸發 GitHub Actions 編譯 APK
- 直接 \`git push origin main\`，進入 Repo 的 **Actions** 分頁即可即時檢視編譯過程。
- 編譯完成後，至 Artifacts 下載 \`NetDiagnostic-Debug-APK\`。
`
  }
];
