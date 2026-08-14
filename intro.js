// ======================================================
// INTRO + GOOGLE PHOTOREALISTIC EXPERIENCE
// ======================================================


// ======================================================
// HTML ELEMENTS
// ======================================================

const introScreen =
  document.getElementById("intro-screen");

const earthScreen =
  document.getElementById("earth-screen");

const modelScreen =
  document.getElementById("model-screen");

const startButton =
  document.getElementById("start-experience");

const skipIntroButton =
  document.getElementById("skip-intro");

const backToMapButton =
  document.getElementById("back-to-map");

const backTo3DButton =
  document.getElementById("back-to-3d");

const flightStatus =
  document.getElementById("flight-status");

const projectTitleButton =
  document.getElementById("project-link");

const introInstruction =
  document.querySelector(".intro-instruction");

const cinematicLandmark =
  document.getElementById("cinematic-landmark");

const cinematicCity =
  document.getElementById("cinematic-city");

const cinematicName =
  document.getElementById("cinematic-name");

const cinematicSequence =
  document.getElementById("cinematic-sequence");

const introMontage =
  document.getElementById("intro-montage");

const introMontageSlideA =
  document.getElementById("intro-montage-slide-a");

const introMontageSlideB =
  document.getElementById("intro-montage-slide-b");

const introMontageLocation =
  document.getElementById("intro-montage-location");

// ======================================================
// LAZY ASSET LOADING
// ======================================================

let cesiumLibraryPromise = null;
let modelModulePromise = null;

function ensureCesiumLibrary() {
  if (window.Cesium) return Promise.resolve(window.Cesium);
  if (cesiumLibraryPromise) return cesiumLibraryPromise;

  cesiumLibraryPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-cesium-css]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cesium.com/downloads/cesiumjs/releases/1.143/Build/Cesium/Widgets/widgets.css';
      css.dataset.cesiumCss = 'true';
      document.head.appendChild(css);
    }

    const existing = document.querySelector('script[data-cesium-js]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Cesium), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const js = document.createElement('script');
    js.src = 'https://cesium.com/downloads/cesiumjs/releases/1.143/Build/Cesium/Cesium.js';
    js.async = true;
    js.dataset.cesiumJs = 'true';
    js.onload = () => resolve(window.Cesium);
    js.onerror = reject;
    document.head.appendChild(js);
  });

  return cesiumLibraryPromise;
}

function warmCesiumLibraryInBackground() {
  const warm = () => {
    ensureCesiumLibrary().catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warm, { timeout: 1800 });
  } else {
    window.setTimeout(warm, 900);
  }
}

warmCesiumLibraryInBackground();

// Warm the heavy 3D assets while the cinematic intro is already playing.
// This only downloads them into the browser HTTP cache; it does NOT decode
// millions of points or allocate their GPU buffers during the intro, so the
// Cesium animation stays responsive. When the user later enables a point-cloud
// layer, most or all of the network wait has already happened.
function warmThreeDAssetsInBackground() {
  // V51: keep intro/network light. Point clouds are intentionally NOT
  // prefetched; they download only when the user enables their layer.
  // The two comparatively light model files may still be warmed in cache.
  const assets = [
    "./models/ext-model.glb",
    "./models/int-model.glb"
  ];

  async function warmAsset(url) {
    try {
      const response = await fetch(url, { cache: "force-cache" });
      if (response.ok) {
        await response.arrayBuffer();
      }
    } catch (_) {
      // Preloading is an optimization only; normal layer loading remains available.
    }
  }

  const warm = async () => {
    await Promise.allSettled(assets.map(warmAsset));
  };

  window.setTimeout(() => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => { void warm(); }, { timeout: 1200 });
    } else {
      void warm();
    }
  }, 900);
}

warmThreeDAssetsInBackground();


function ensureModelViewerModule() {
  if (window.__thesisModelModuleLoaded) return Promise.resolve();
  if (modelModulePromise) return modelModulePromise;

  modelModulePromise = new Promise((resolve, reject) => {
    const js = document.createElement('script');
    js.type = 'module';
    js.src = './script.js?v=heritage-platform-48-folder-structure';
    js.onload = () => {
      window.__thesisModelModuleLoaded = true;
      resolve();
    };
    js.onerror = reject;
    document.body.appendChild(js);
  });

  return modelModulePromise;
}

// ======================================================
// CESIUM SETTINGS
// ======================================================

// Paste your real Cesium ion token here.
// Keep the quotation marks.

const CESIUM_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYTQ2ZjViNi1mMzM3LTQ3ZDMtYTAwYS1jMzkzYzgyMjIyYTMiLCJpZCI6NDE4NTM1LCJzdWIiOiJtYWh0YWJmbGgiLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoibWFodGFiZmxoX2RlZmF1bHQiLCJpYXQiOjE3ODM5NDE1MjJ9.7m__D10D939Eqyb-fdZECGGBEgcZJg6IQCWt9S1y7u4";


// Google Photorealistic 3D Tiles
// Asset ID from your Cesium ion account.

const GOOGLE_PHOTOREALISTIC_ASSET_ID =
  2275207;


// ======================================================
// EXACT LOCATIONS
// ======================================================

const italyOverviewLocation = {
  name: "Italy",
  longitude: 12.5,
  latitude: 42.5,
  fallbackHeight: 0,
  heading: 0,
  pitch: -89,
  range: 1350000
};

const pugliaOverviewLocation = {
  name: "Puglia",
  longitude: 16.75,
  latitude: 40.95,
  fallbackHeight: 3000,
  heading: 330,
  pitch: -76,
  range: 250000
};

const churchLocation = {
  name: "Chiesa di Sant'Antonio dei Cappuccini",
  longitude: 17.337743811494857,
  latitude: 40.714900678946975,
  fallbackHeight: 430,
  heading: 24,
  pitch: -34,
  range: 170
};

// ======================================================
// CINEMATIC FLIGHT STOPS
// ======================================================

const cinematicStops = [
  {
    city: "PUGLIA",
    name: "Puglia Region",
    longitude: pugliaOverviewLocation.longitude,
    latitude: pugliaOverviewLocation.latitude,
    altitude: 118000,
    heading: 5,
    pitch: -84,
    duration: 1.7
  },
  {
    city: "MARTINA FRANCA",
    name: "Martina Franca",
    longitude: churchLocation.longitude,
    latitude: churchLocation.latitude,
    altitude: 7600,
    heading: 10,
    pitch: -79,
    duration: 4.15
  },
  {
    city: "MARTINA FRANCA",
    name: "Chiesa di Sant'Antonio dei Cappuccini",
    longitude: churchLocation.longitude,
    latitude: churchLocation.latitude,
    altitude: 1600,
    heading: 24,
    pitch: -34,
    range: 300,
    duration: 3.35,
    useSurfaceTarget: true
  }
];

// ======================================================
// INTRO PHOTO MONTAGE
// ======================================================

const introPhotoSequence = [
  { src: "./photos/italy-sequence/italy(1).png", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(2).jpg", label: "CINQUE TERRE", hold: 220 },
  { src: "./photos/italy-sequence/italy(3).jpg", label: "AMALFI COAST", hold: 220 },
  { src: "./photos/italy-sequence/italy(4).jpg", label: "TORINO", hold: 220 },
  { src: "./photos/italy-sequence/italy(5).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(6).jpg", label: "MILANO", hold: 220 },
  { src: "./photos/italy-sequence/italy(7).jpg", label: "MILANO", hold: 220 },
  { src: "./photos/italy-sequence/italy(8).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(9).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(10).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(11).jpg", label: "GENOVA", hold: 220 },
  { src: "./photos/italy-sequence/italy(12).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(13).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(14).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(15).jpg", label: "MILANO", hold: 220 },
  { src: "./photos/italy-sequence/italy(16).jpg", label: "VENEZIA", hold: 220 },
  { src: "./photos/italy-sequence/italy(17).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(18).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(19).jpg", label: "ROMA", hold: 220 },
  { src: "./photos/italy-sequence/italy(20).jpg", label: "UMBRIA", hold: 220 },
  { src: "./photos/italy-sequence/italy(21).jpg", label: "VENEZIA", hold: 220 },
  { src: "./photos/italy-sequence/italy(22).jpg", label: "FIRENZE", hold: 220 },
  { src: "./photos/italy-sequence/italy(1).jpg", label: "PUGLIA", hold: 1100 }
];

let introMontagePreloadPromise = null;
let introSequenceToken = 0;
const introPhotoElements = new Map();

// ======================================================
// FLIGHT SETTINGS
// ======================================================

// One continuous flight.
// Lower number = faster flight.

const FLIGHT_DURATION_SECONDS =
  7.5;


// How high the camera can rise during the flight.

const FLIGHT_MAXIMUM_HEIGHT =
  1600000;


// ======================================================
// APPLICATION STATE
// ======================================================

let cesiumViewer =
  null;

let googleTileset =
  null;

let startMarkerEntity =
  null;

let churchMarkerEntity =
  null;

let mapInteractionHandler =
  null;

let earthInitialized =
  false;

let initializationInProgress =
  false;

let flightStarted =
  false;

let modelViewerStarted =
  false;


// ======================================================
// VALIDATION
// ======================================================

if (
  !introScreen ||
  !earthScreen ||
  !modelScreen ||
  !startButton ||
  !flightStatus
) {

  throw new Error(
    "Required HTML elements are missing."
  );
}


// Make the reveal fast, without showing
// the blurred loading stage.

introScreen.style.transition =
  "opacity 0.25s ease, visibility 0.25s ease";


// ======================================================
// GENERAL HELPERS
// ======================================================

function delay(milliseconds) {

  return new Promise(
    function (resolve) {

      window.setTimeout(
        resolve,
        milliseconds
      );

    }
  );
}


function updateStatus(message) {

  flightStatus.textContent =
    message;
}


// ======================================================
// SCREEN MANAGEMENT
// ======================================================

function showScreen(targetScreen) {

  const screens = [
    introScreen,
    earthScreen,
    modelScreen
  ];


  screens.forEach(
    function (screen) {

      screen.classList.add(
        "is-hidden"
      );

    }
  );


  targetScreen.classList.remove(
    "is-hidden"
  );
}


// ======================================================
// MODEL VIEWER
// ======================================================

async function openModelViewer() {

  showScreen(modelScreen);

  try {
    await ensureModelViewerModule();
  } catch (error) {
    console.error("Could not load the 3D viewer module:", error);
    return;
  }

  window.setTimeout(function () {
    if (!modelViewerStarted) {
      modelViewerStarted = true;
      window.dispatchEvent(new CustomEvent("openModelViewer"));
    }

    window.dispatchEvent(new Event("resize"));
  }, 40);
}


async function waitForEarthInitialization(
  timeout = 30000
) {

  const startedAt =
    Date.now();


  while (
    initializationInProgress &&
    Date.now() - startedAt < timeout
  ) {

    await delay(
      200
    );
  }


  return earthInitialized;
}


async function ensureEarthIsReady() {

  if (earthInitialized) {
    return true;
  }


  if (!initializationInProgress) {

    initializeEarth();
  }


  return waitForEarthInitialization();
}


async function returnToMap() {

  showScreen(
    earthScreen
  );


  updateStatus(
    earthInitialized
      ? "Chiesa di Sant'Antonio dei Cappuccini · Martina Franca"
      : "Loading map..."
  );


  await ensureEarthIsReady();

  if (earthInitialized) {
    focusFinalChurchView();
  }

  window.setTimeout(
    function () {

      window.dispatchEvent(

        new Event(
          "resize"
        )

      );


      if (cesiumViewer) {

        cesiumViewer.resize();

        cesiumViewer.scene.requestRender();
      }

    },
    150
  );
}


// ======================================================
// LOCATION POSITION
// ======================================================

function getApproximatePosition(location) {

  return Cesium.Cartesian3.fromDegrees(

    location.longitude,
    location.latitude,
    location.fallbackHeight

  );
}


// ======================================================
// EXACT HEIGHT FROM GOOGLE 3D TILES
// ======================================================

async function getExactSurfacePosition(location) {

  if (!cesiumViewer) {

    return getApproximatePosition(
      location
    );
  }


  const initialPosition =
    Cesium.Cartesian3.fromDegrees(

      location.longitude,
      location.latitude,
      location.fallbackHeight + 1000

    );


  for (
    let attempt = 1;
    attempt <= 6;
    attempt++
  ) {

    try {

      const clampedPositions =
        await cesiumViewer
          .scene
          .clampToHeightMostDetailed(

            [
              initialPosition
            ]

          );


      const clampedPosition =
        clampedPositions[0];


      if (
        Cesium.defined(
          clampedPosition
        )
      ) {

        const cartographic =
          Cesium.Cartographic
            .fromCartesian(
              clampedPosition
            );


        return Cesium.Cartesian3
          .fromRadians(

            cartographic.longitude,
            cartographic.latitude,
            cartographic.height + 3

          );
      }

    } catch (error) {

      console.warn(
        `Height attempt ${attempt} failed:`,
        error
      );
    }


    await delay(
      500
    );
  }


  return getApproximatePosition(
    location
  );
}


// ======================================================
// CAMERA OFFSET
// ======================================================

function createCameraOffset(location) {

  return new Cesium.HeadingPitchRange(

    Cesium.Math.toRadians(
      location.heading
    ),

    Cesium.Math.toRadians(
      location.pitch
    ),

    location.range

  );
}


// ======================================================
// IMMEDIATE CAMERA FOCUS
// ======================================================

function focusCameraImmediately(
  position,
  location
) {

  if (!cesiumViewer) {
    return;
  }


  const boundingSphere =
    new Cesium.BoundingSphere(

      position,
      1

    );


  cesiumViewer.camera.viewBoundingSphere(

    boundingSphere,

    createCameraOffset(
      location
    )

  );


  cesiumViewer.camera.lookAtTransform(

    Cesium.Matrix4.IDENTITY

  );


  cesiumViewer.scene.requestRender();
}


// ======================================================
// WAIT UNTIL CURRENT VIEW IS READY
// ======================================================

function waitForCurrentViewToLoad(
  tileset,
  timeout = 20000
) {

  return new Promise(
    function (resolve) {

      let finished =
        false;

      let stableTimer =
        null;

      let timeoutTimer =
        null;

      let removeProgressListener =
        null;

      let removeLoadedListener =
        null;


      function clearStableTimer() {

        if (stableTimer) {

          window.clearTimeout(
            stableTimer
          );

          stableTimer =
            null;
        }
      }


      function finish() {

        if (finished) {
          return;
        }


        finished =
          true;


        clearStableTimer();


        if (timeoutTimer) {

          window.clearTimeout(
            timeoutTimer
          );
        }


        if (removeProgressListener) {

          removeProgressListener();
        }


        if (removeLoadedListener) {

          removeLoadedListener();
        }


        resolve();
      }


      function scheduleFinish() {

        clearStableTimer();


        stableTimer =
          window.setTimeout(

            function () {

              if (tileset.tilesLoaded) {

                finish();
              }

            },

            900

          );
      }


      removeProgressListener =
        tileset.loadProgress
          .addEventListener(

            function (
              pendingRequests,
              processingTiles
            ) {

              if (
                pendingRequests === 0 &&
                processingTiles === 0
              ) {

                scheduleFinish();

              } else {

                clearStableTimer();
              }

            }

          );


      removeLoadedListener =
        tileset.allTilesLoaded
          .addEventListener(

            function () {

              scheduleFinish();

            }

          );


      timeoutTimer =
        window.setTimeout(

          finish,
          timeout

        );


      /*
      Give Cesium two frames to start
      requesting tiles for the new view.
      */

      window.requestAnimationFrame(
        function () {

          window.requestAnimationFrame(
            function () {

              if (tileset.tilesLoaded) {

                scheduleFinish();
              }

            }
          );

        }
      );

    }
  );
}


// ======================================================
// LOCATION MARKER
// ======================================================

function addLocationMarker(
  position,
  location,
  labelText
) {

  if (!cesiumViewer) {
    return null;
  }


  return cesiumViewer.entities.add({

    name:
      location.name,


    position:
      position,


    point: {

      pixelSize:
        14,

      color:
        Cesium.Color.WHITE,

      outlineColor:
        Cesium.Color.BLACK,

      outlineWidth:
        3,

      disableDepthTestDistance:
        Number.POSITIVE_INFINITY

    },


    label: {

      text:
        labelText,

      font:
        "600 12px Arial",

      fillColor:
        Cesium.Color.WHITE,

      outlineColor:
        Cesium.Color.BLACK,

      outlineWidth:
        2,

      style:
        Cesium.LabelStyle
          .FILL_AND_OUTLINE,

      showBackground:
        true,

      backgroundColor:
        new Cesium.Color(
          0,
          0,
          0,
          0.78
        ),

      backgroundPadding:
        new Cesium.Cartesian2(
          11,
          7
        ),

      pixelOffset:
        new Cesium.Cartesian2(
          0,
          -36
        ),

      horizontalOrigin:
        Cesium.HorizontalOrigin
          .CENTER,

      verticalOrigin:
        Cesium.VerticalOrigin
          .BOTTOM,

      disableDepthTestDistance:
        Number.POSITIVE_INFINITY

    }

  });
}


// ======================================================
// CHURCH CLICK INTERACTION
// ======================================================

function installChurchClickInteraction() {

  if (
    !cesiumViewer ||
    mapInteractionHandler
  ) {
    return;
  }


  mapInteractionHandler =
    new Cesium.ScreenSpaceEventHandler(

      cesiumViewer
        .scene
        .canvas

    );


  mapInteractionHandler.setInputAction(

    function (movement) {

      const pickedObject =
        cesiumViewer.scene.pick(

          movement.position

        );


      if (
        Cesium.defined(
          pickedObject
        ) &&
        pickedObject.id ===
          churchMarkerEntity
      ) {

        openModelViewer();

      }

    },

    Cesium.ScreenSpaceEventType
      .LEFT_CLICK

  );


  mapInteractionHandler.setInputAction(

    function (movement) {

      const pickedObject =
        cesiumViewer.scene.pick(

          movement.endPosition

        );


      const isChurchMarker =

        Cesium.defined(
          pickedObject
        ) &&

        pickedObject.id ===
          churchMarkerEntity;


      cesiumViewer
        .scene
        .canvas
        .style
        .cursor =

          isChurchMarker
            ? "pointer"
            : "default";

    },

    Cesium.ScreenSpaceEventType
      .MOUSE_MOVE

  );
}


// ======================================================
// GOOGLE PHOTOREALISTIC TILES
// ======================================================

async function loadGoogleTiles() {

  updateStatus(
    "Loading Italy"
  );


  googleTileset =
    await Cesium
      .Cesium3DTileset
      .fromIonAssetId(

        GOOGLE_PHOTOREALISTIC_ASSET_ID

      );


  // Presentation lighting: keep photorealistic landmarks readable
  // regardless of the visitor's local time.
  if (googleTileset.imageBasedLighting) {
    googleTileset.imageBasedLighting.imageBasedLightingFactor =
      new Cesium.Cartesian2(1.18, 1.12);
  }

  googleTileset.lightColor =
    new Cesium.Cartesian3(1.08, 1.08, 1.08);


  // Use a lighter level of detail while the camera is moving.
  // The final church view is sharpened after arrival.
  googleTileset.maximumScreenSpaceError =
    14;


  googleTileset.dynamicScreenSpaceError =
    true;


  googleTileset.preloadFlightDestinations =
    true;


  googleTileset.preloadWhenHidden =
    false;


  cesiumViewer.scene.primitives.add(

    googleTileset

  );
}


// ======================================================
// INITIALIZE EARTH BEHIND THE BLACK SCREEN
// ======================================================

async function initializeEarth() {

  if (earthInitialized || initializationInProgress) {
    return;
  }

  initializationInProgress = true;

  try {
    await ensureCesiumLibrary();

    if (!CESIUM_TOKEN || CESIUM_TOKEN.includes("PASTE_YOUR")) {
      throw new Error("Cesium ion token is missing.");
    }

    Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

    cesiumViewer = new Cesium.Viewer(
      "cesiumContainer",
      {
        globe: false,
        animation: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        baseLayerPicker: false,
        infoBox: false,
        selectionIndicator: false,
        shouldAnimate: true,
        requestRenderMode: false
      }
    );

    // Keep the cinematic route in stable daylight instead of inheriting
    // the visitor's real local time (which can make Italy render at night).
    cesiumViewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
      "2026-06-21T10:30:00Z"
    );
    cesiumViewer.clock.shouldAnimate = false;

    // Slightly lower render resolution during the cinematic route.
    // This reduces GPU work without changing the camera path.
    cesiumViewer.resolutionScale = 0.9;
    cesiumViewer.scene.backgroundColor = Cesium.Color.BLACK;
    cesiumViewer.scene.fog.enabled = true;
    cesiumViewer.scene.highDynamicRange = false;

    cesiumViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    const approximateStartPosition = getApproximatePosition(pugliaOverviewLocation);
    focusCameraImmediately(approximateStartPosition, pugliaOverviewLocation);

    // Do not wait for photorealistic tiles to become fully detailed.
    // The flight can start as soon as the tileset itself is available.
    await loadGoogleTiles();

    updateStatus("Italy");
    earthInitialized = true;

  } catch (error) {
    console.error("Cesium initialization error:", error);
    updateStatus("Could not load the 3D environment");
    earthInitialized = false;

  } finally {
    initializationInProgress = false;
  }
}


// ======================================================
// CINEMATIC ARCHITECTURAL FLIGHT ACROSS ITALY
// ======================================================

function setCinematicLandmark(stop, index, visible = true) {
  if (!cinematicLandmark) return;

  if (stop && cinematicCity && cinematicName && cinematicSequence) {
    cinematicCity.textContent = stop.city;
    cinematicName.textContent = stop.name;
    cinematicSequence.textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(cinematicStops.length).padStart(2, "0")}`;
  }

  cinematicLandmark.classList.toggle("is-visible", visible);
  cinematicLandmark.setAttribute("aria-hidden", String(!visible));
}


async function flyToCinematicView(stop, index, options = {}) {
  let labelTimer = null;

  if (options.showLabelAtFraction !== undefined) {
    const labelDelay = Math.max(0, stop.duration * options.showLabelAtFraction * 1000);
    labelTimer = window.setTimeout(() => {
      setCinematicLandmark(stop, index, true);
    }, labelDelay);
  }

  if (stop.useSurfaceTarget) {
    const target = await getExactSurfacePosition(churchLocation);
    const sphere = new Cesium.BoundingSphere(target, 1);

    return new Promise(resolve => {
      cesiumViewer.camera.flyToBoundingSphere(sphere, {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(stop.heading),
          Cesium.Math.toRadians(stop.pitch),
          stop.range
        ),
        duration: stop.duration,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: () => {
          if (labelTimer) window.clearTimeout(labelTimer);
          if (options.showLabelAtFraction !== undefined) {
            setCinematicLandmark(stop, index, true);
          }
          cesiumViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          resolve(true);
        },
        cancel: () => {
          if (labelTimer) window.clearTimeout(labelTimer);
          cesiumViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          resolve(false);
        }
      });
    });
  }

  return new Promise(resolve => {
    cesiumViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        stop.longitude,
        stop.latitude,
        stop.altitude
      ),
      orientation: {
        heading: Cesium.Math.toRadians(stop.heading),
        pitch: Cesium.Math.toRadians(stop.pitch),
        roll: 0
      },
      duration: stop.duration,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      complete: () => {
        if (labelTimer) window.clearTimeout(labelTimer);
        if (options.showLabelAtFraction !== undefined) {
          setCinematicLandmark(stop, index, true);
        }
        resolve(true);
      },
      cancel: () => {
        if (labelTimer) window.clearTimeout(labelTimer);
        resolve(false);
      }
    });
  });
}


async function playCinematicFlight() {
  if (!cesiumViewer || flightStarted) return;

  flightStarted = true;
  earthScreen.classList.add("is-flight-running");

  if (googleTileset) {
    googleTileset.maximumScreenSpaceError = 10;
  }
  cesiumViewer.resolutionScale = 1.0;

  const firstStop = cinematicStops[0];
  if (firstStop && firstStop.showLabel !== false) {
    setCinematicLandmark(firstStop, 0, true);
    updateStatus(firstStop.city);
  }

  for (let index = 1; index < cinematicStops.length; index++) {
    const stop = cinematicStops[index];
    const previous = cinematicStops[index - 1];

    updateStatus(previous ? `${previous.city} → ${stop.city}` : stop.city);

    const flyOptions = stop.showLabel === false
      ? {}
      : { showLabelAtFraction: index === cinematicStops.length - 1 ? 0.74 : 0.46 };

    const completed = await flyToCinematicView(stop, index, flyOptions);

    if (!completed) break;
  }

  const finalStop = cinematicStops[cinematicStops.length - 1];
  const churchPosition = await getExactSurfacePosition(churchLocation);

  if (googleTileset) {
    googleTileset.maximumScreenSpaceError = 6;
  }
  cesiumViewer.resolutionScale = 1.0;

  if (churchMarkerEntity) {
    cesiumViewer.entities.remove(churchMarkerEntity);
  }

  churchMarkerEntity = addLocationMarker(
    churchPosition,
    churchLocation,
    "Chiesa di Sant'Antonio dei Cappuccini — Click to Explore"
  );

  installChurchClickInteraction();
  updateStatus("Chiesa di Sant'Antonio dei Cappuccini · Martina Franca");
  earthScreen.classList.remove("is-flight-running");
  flightStarted = false;

  cesiumViewer.scene.requestRender();
}


async function focusFinalChurchView() {
  if (!cesiumViewer) return;

  const finalStop = cinematicStops[cinematicStops.length - 1];
  const target = await getExactSurfacePosition(churchLocation);
  const sphere = new Cesium.BoundingSphere(target, 1);

  cesiumViewer.camera.viewBoundingSphere(
    sphere,
    new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(finalStop.heading),
      Cesium.Math.toRadians(finalStop.pitch),
      finalStop.range
    )
  );
  cesiumViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  cesiumViewer.scene.requestRender();
}


function preloadIntroPhotoSequence() {
  if (introMontagePreloadPromise) return introMontagePreloadPromise;

  introMontagePreloadPromise = Promise.all(
    introPhotoSequence.map(item => new Promise(resolve => {
      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";
      image.onload = () => {
        introPhotoElements.set(item.src, image);
        resolve(true);
      };
      image.onerror = () => resolve(false);
      image.src = item.src;
    }))
  );

  return introMontagePreloadPromise;
}

function setMontageLocation(label) {
  if (!introMontageLocation) return;
  introMontageLocation.classList.remove("is-visible");
  introMontageLocation.textContent = label;
  void introMontageLocation.offsetWidth;
  introMontageLocation.classList.add("is-visible");
}

function setMontageSlide(slide, item) {
  if (!slide || !item) return;

  let imageElement = slide.querySelector("img");
  if (!imageElement) {
    imageElement = document.createElement("img");
    imageElement.alt = item.label || "Italy travel photograph";
    imageElement.draggable = false;
    slide.appendChild(imageElement);
  }

  imageElement.src = item.src;
  imageElement.alt = item.label || "Italy travel photograph";
}

async function playIntroPhotoMontage() {
  if (!introScreen || !introMontage || !introMontageSlideA || !introMontageSlideB) {
    return true;
  }

  const token = ++introSequenceToken;
  await preloadIntroPhotoSequence();

  const slides = [introMontageSlideA, introMontageSlideB];
  slides.forEach(slide => slide.classList.remove("is-visible"));
  introScreen.classList.add("is-playing-montage");
  introMontage.setAttribute("aria-hidden", "false");

  let currentSlideIndex = 0;
  const firstItem = introPhotoSequence[0];
  setMontageSlide(slides[currentSlideIndex], firstItem);
  slides[currentSlideIndex].classList.add("is-visible");
  setMontageLocation(firstItem.label);

  await delay(160);

  for (let index = 1; index < introPhotoSequence.length; index++) {
    if (token !== introSequenceToken) {
      return false;
    }

    const item = introPhotoSequence[index];
    const nextSlideIndex = currentSlideIndex === 0 ? 1 : 0;
    setMontageSlide(slides[nextSlideIndex], item);
    slides[nextSlideIndex].classList.add("is-visible");
    slides[currentSlideIndex].classList.remove("is-visible");
    setMontageLocation(item.label);
    currentSlideIndex = nextSlideIndex;
    await delay(item.hold);
  }

  await delay(140);
  return token === introSequenceToken;
}

// ======================================================
// INTRO CLICK — REAL CINEMATIC FLIGHT
// ======================================================

startButton.addEventListener("click", async function () {
  if (startButton.disabled) return;
  startButton.disabled = true;
  introSequenceToken += 1;

  if (introInstruction) {
    introInstruction.textContent = "Loading cinematic sequence…";
  }

  earthScreen.classList.remove("is-hidden");

  await Promise.all([
    initializeEarth(),
    preloadIntroPhotoSequence()
  ]);

  if (!earthInitialized) {
    earthScreen.classList.add("is-hidden");
    startButton.disabled = false;
    if (introInstruction) {
      introInstruction.textContent = "Flight unavailable — click to retry";
    }
    return;
  }

  const montageCompleted = await playIntroPhotoMontage();

  if (!montageCompleted) {
    startButton.disabled = false;
    return;
  }

  introScreen.classList.add("is-hidden");
  await delay(160);
  await playCinematicFlight();
  startButton.disabled = false;
});


// ======================================================
// SKIP INTRO / FLIGHT
// ======================================================

if (skipIntroButton) {
  skipIntroButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    introSequenceToken += 1;
    introScreen.classList.add("is-hidden");
    void openModelViewer();
  });
}


// ======================================================
// BACK TO MAP
// ======================================================

if (backToMapButton) {

  backToMapButton.addEventListener(

    "click",

    function () {

      void returnToMap();

    }

  );
}


// ======================================================
// BACK TO 3D FROM MAP
// ======================================================

if (backTo3DButton) {

  backTo3DButton.addEventListener(

    "click",

    function () {

      openModelViewer();

    }

  );
}


// ======================================================
// PROJECT TITLE
// ======================================================

if (projectTitleButton) {

  projectTitleButton.addEventListener(

    "click",

    function () {

      openModelViewer();

    }

  );
}