import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  TransformControls
} from "three/addons/controls/TransformControls.js";


import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
  DRACOLoader
} from "three/addons/loaders/DRACOLoader.js";

import {
  Line2
} from "three/addons/lines/Line2.js";

import {
  LineGeometry
} from "three/addons/lines/LineGeometry.js";

import {
  LineMaterial
} from "three/addons/lines/LineMaterial.js";

import {
  LineSegments2
} from "three/addons/lines/LineSegments2.js";

import {
  LineSegmentsGeometry
} from "three/addons/lines/LineSegmentsGeometry.js";


import {
  CSS2DRenderer,
  CSS2DObject
} from "three/addons/renderers/CSS2DRenderer.js";


// ==================================
// HTML ELEMENTS
// ==================================

const viewer =
  document.getElementById("viewer");

const loadingElement =
  document.getElementById("loading");

const toggleGroundButton =
  document.getElementById("toggle-ground");

const toggleSectionButton =
  document.getElementById("toggle-section");

const sectionModeToolbar =
  document.getElementById("section-mode-toolbar");

const sectionModeButtons =
  Array.from(document.querySelectorAll("[data-section-mode]"));

const resetSectionBoxButton =
  document.getElementById("reset-section-box");

const modelSidebar =
  document.getElementById("model-sidebar") || document.querySelector(".sidebar");

// Mobile layout / asset selection.
// Phones and small tablets use lighter point-cloud files when available.
const mobileLayoutQuery = window.matchMedia("(max-width: 900px)");
const useMobilePointCloudAssets = window.matchMedia("(max-width: 980px)").matches;

const sidebarCollapseToggle =
  document.getElementById("sidebar-collapse-toggle");

const modelDisplaySelects =
  Array.from(
    document.querySelectorAll(
      "[data-display-mode]"
    )
  );

const pointDisplaySelects =
  Array.from(
    document.querySelectorAll(
      "[data-point-display-mode]"
    )
  );

const pointSizeInputs =
  Array.from(
    document.querySelectorAll(
      "[data-point-size]"
    )
  );

const pointSizeValueOutputs =
  Array.from(
    document.querySelectorAll(
      "[data-point-size-value]"
    )
  );

const decayMasterCheckbox =
  document.getElementById(
    "toggle-decay-detection"
  );

const decayColorInputs =
  Array.from(
    document.querySelectorAll(
      "[data-decay-color]"
    )
  );

const decayLineThicknessInput =
  document.getElementById(
    "decay-line-thickness"
  );

const decayLineThicknessValue =
  document.getElementById(
    "decay-line-thickness-value"
  );

const measureDistanceButton =
  document.getElementById("measure-distance");

const measureAngleButton =
  document.getElementById("measure-angle");

const clearMeasurementsButton =
  document.getElementById("clear-measurements");

const measurementStatus =
  document.getElementById("measurement-status");

const openPhotoPanelButton =
  document.getElementById("open-photo-panel");

const openInfoPanelButton =
  document.getElementById("open-info-panel");

const surveyPhotoPanel =
  document.getElementById("survey-photo-panel");

const surveyInfoPanel =
  document.getElementById("survey-info-panel");

const surveyPhotoGallery =
  document.getElementById("survey-photo-gallery");

const photoCategoryButtons =
  Array.from(
    document.querySelectorAll(
      "[data-photo-category]"
    )
  );

const drawerCloseButtons =
  Array.from(
    document.querySelectorAll(
      "[data-close-drawer]"
    )
  );

const photoLightbox =
  document.getElementById("photo-lightbox");

const closePhotoLightboxButton =
  document.getElementById("close-photo-lightbox");

const photoLightboxImage =
  document.getElementById("photo-lightbox-image");

const photoLightboxCaption =
  document.getElementById("photo-lightbox-caption");

const photoLightboxCounter =
  document.getElementById("photo-lightbox-counter");

const photoLightboxStage =
  document.getElementById("photo-lightbox-stage");

const photoLightboxPreviousButton =
  document.getElementById("photo-lightbox-previous");

const photoLightboxNextButton =
  document.getElementById("photo-lightbox-next");

const photoZoomOutButton =
  document.getElementById("photo-zoom-out");

const photoZoomResetButton =
  document.getElementById("photo-zoom-reset");

const photoZoomInButton =
  document.getElementById("photo-zoom-in");

const analysisInspector = document.getElementById("analysis-inspector");
const analysisInspectorTitle = document.getElementById("analysis-inspector-title");
const analysisInspectorKicker = document.getElementById("analysis-inspector-kicker");
const analysisInspectorBody = document.getElementById("analysis-inspector-body");
const closeAnalysisInspectorButton = document.getElementById("close-analysis-inspector");
const measurementUnitSelect = document.getElementById("measurement-unit");
const measurementHistory = document.getElementById("measurement-history");
const measurementHistoryList = document.getElementById("measurement-history-list");
const measurementHistoryCount = document.getElementById("measurement-history-count");
const measurementHistoryEmpty = document.getElementById("measurement-history-empty");
const modelColorInputs = Array.from(document.querySelectorAll("[data-model-color]"));
const layerOpacityInputs = Array.from(document.querySelectorAll("[data-layer-opacity]"));
const backgroundPresetButtons = Array.from(document.querySelectorAll("[data-background-preset]"));
const backgroundCustomInput = document.getElementById("background-custom-color");
const measurementColorInput = document.getElementById("measurement-color");
const decayInfoButtons = Array.from(document.querySelectorAll("[data-decay-info]"));


if (!viewer) {

  throw new Error(
    'Element with id="viewer" was not found.'
  );

}

function setSidebarCollapsed(collapsed) {
  if (!modelSidebar || !sidebarCollapseToggle) return;

  modelSidebar.classList.toggle("is-collapsed", collapsed);
  document.getElementById("model-screen")?.classList.toggle("sidebar-collapsed", collapsed);
  sidebarCollapseToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarCollapseToggle.setAttribute(
    "aria-label",
    collapsed ? "Expand 3D Model Explorer" : "Collapse 3D Model Explorer"
  );
  sidebarCollapseToggle.title =
    collapsed ? "Expand 3D Model Explorer" : "Collapse 3D Model Explorer";
  sidebarCollapseToggle.textContent = collapsed ? "‹" : "›";
}

if (sidebarCollapseToggle && modelSidebar) {
  sidebarCollapseToggle.addEventListener("click", function () {
    setSidebarCollapsed(!modelSidebar.classList.contains("is-collapsed"));
  });
}

// Start with the layer drawer collapsed on phones so the 3D model is visible first.
if (mobileLayoutQuery.matches) {
  setSidebarCollapsed(true);
}


// ==================================
// SCENE
// ==================================

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(
    0x4b5159
  );


// ==================================
// CAMERA
// ==================================

const camera =
  new THREE.PerspectiveCamera(

    45,

    window.innerWidth /
      window.innerHeight,

    // Keep a sane near/far ratio. The previous 0.001 -> 10,000,000
    // range wastes depth-buffer precision and is especially prone to
    // model/point-cloud z-fighting on mobile GPUs.
    0.01,
    5000

  );

camera.position.set(
  10,
  10,
  10
);


// ==================================
// RENDERER
// ==================================

const renderer =
  new THREE.WebGLRenderer({

    // MSAA is expensive with multi-million-point survey clouds.
    // Pixel-sized points do not benefit enough to justify the GPU cost.
    antialias: false,

    alpha: false,

    powerPreference:
      "high-performance"

  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

const VIEWER_PIXEL_RATIO_CAP =
  useMobilePointCloudAssets ? 1 : 1.25;

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    VIEWER_PIXEL_RATIO_CAP
  )
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.NeutralToneMapping;

renderer.toneMappingExposure =
  1.32;

renderer.localClippingEnabled =
  true;

viewer.appendChild(
  renderer.domElement
);



// ==================================
// HTML LABEL RENDERER
// ==================================

const labelRenderer =
  new CSS2DRenderer();

labelRenderer.setSize(
  window.innerWidth,
  window.innerHeight
);

labelRenderer.domElement.className =
  "measurement-label-layer";

viewer.appendChild(
  labelRenderer.domElement
);


// ==================================
// ORBIT CONTROLS
// ==================================

const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );

controls.enableDamping = true;
controls.dampingFactor = 0.06;

controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;

controls.screenSpacePanning = true;

controls.minDistance = 0.001;
controls.maxDistance = 10000000;


// ==================================
// ARCHITECTURAL LIGHTING
// ==================================

const hemisphereLight =
  new THREE.HemisphereLight(

    0xffffff,
    0x68717b,
    1.55

  );

scene.add(
  hemisphereLight
);


const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    0.38
  );

scene.add(
  ambientLight
);


const keyLight =
  new THREE.DirectionalLight(
    0xfff8ee,
    2.55
  );

const fillLight =
  new THREE.DirectionalLight(
    0xe4efff,
    1.20
  );

const rimLight =
  new THREE.DirectionalLight(
    0xffffff,
    0.78
  );

scene.add(
  keyLight,
  keyLight.target,
  fillLight,
  fillLight.target,
  rimLight,
  rimLight.target
);


function updateArchitecturalLighting(
  bounds
) {

  if (!bounds) {
    return;
  }


  const center =
    bounds.getCenter(
      new THREE.Vector3()
    );

  const size =
    bounds.getSize(
      new THREE.Vector3()
    );

  const radius =
    Math.max(
      size.x,
      size.y,
      size.z,
      1
    );


  keyLight.position.copy(
    center.clone().add(
      new THREE.Vector3(
        1.15,
        1.55,
        0.9
      ).multiplyScalar(
        radius * 1.4
      )
    )
  );

  fillLight.position.copy(
    center.clone().add(
      new THREE.Vector3(
        -1.1,
        0.65,
        -0.75
      ).multiplyScalar(
        radius * 1.2
      )
    )
  );

  rimLight.position.copy(
    center.clone().add(
      new THREE.Vector3(
        0.15,
        1.8,
        -1.35
      ).multiplyScalar(
        radius * 1.25
      )
    )
  );


  keyLight.target.position.copy(
    center
  );

  fillLight.target.position.copy(
    center
  );

  rimLight.target.position.copy(
    center
  );


  keyLight.target.updateMatrixWorld();
  fillLight.target.updateMatrixWorld();
  rimLight.target.updateMatrixWorld();
}


// ==================================
// ROOT GROUP
// ==================================

const rootGroup =
  new THREE.Group();

scene.add(
  rootGroup
);




// ==================================
// CONSERVATION INFORMATION + MATERIAL HOTSPOTS
// ==================================
// GLB FILES
// ==================================

const layerFiles = {

  extModel:
    "./models/ext-model.glb",

  extPC:
    "./pointclouds/ext-pc.drc",

  intModel:
    "./models/int-model.glb",

  intPC:
    "./pointclouds/int-pc.drc",

  leftPC:
    "./pointclouds/left-pc.glb",

  decayBiological:
    "./decay/decay-biological.json",

  decayPatchRepair:
    "./decay/decay-patch-repair.json",

  decayDiscoloration:
    "./decay/decay-discoloration.json",

  decaySoiling:
    "./decay/decay-soiling.json"

};


// ==================================
// LOADER VARIABLES
// ==================================

const loader =
  new GLTFLoader();

// Standalone Draco point-cloud decoder. The decoder files are served from
// the same Three.js version used by this viewer, so local hosting and
// GitHub Pages do not need an extra decoder folder.
const dracoLoader =
  new DRACOLoader();

dracoLoader.setDecoderPath(
  "https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs/draco/"
);

dracoLoader.setWorkerLimit(
  useMobilePointCloudAssets ? 2 : 4
);

dracoLoader.preload();

// Adaptive point-cloud rendering keeps the full survey untouched, but uses
// a lightweight indexed proxy only while the camera is moving. Once the
// camera settles, the full-density Draco cloud is restored automatically.
// Moving-camera proxy budgets. Keep enough geometry for architectural
// reading, but avoid drawing the full 10M+ point survey while orbiting.
const ADAPTIVE_POINT_BUDGETS = useMobilePointCloudAssets
  ? { extPC: 900000, intPC: 1100000, leftPC: 600000 }
  : { extPC: 2800000, intPC: 3200000, leftPC: 1600000 };

const ADAPTIVE_FULL_QUALITY_DELAY_MS =
  useMobilePointCloudAssets ? 280 : 190;

// V51: interaction still renders every frame, but an unchanged 3D canvas
// refreshes only occasionally so the rest of the page/UI keeps more CPU/GPU time.
const STATIC_RENDER_INTERVAL_MS =
  useMobilePointCloudAssets ? 1500 : 1200;

// Screen-space point sizing. The viewer enlarges points smoothly as the camera
// approaches the survey, which fills the apparent gaps that otherwise appear
// at particular zoom levels. It shrinks them again from a distance so the cloud
// does not look blobby.
const POINT_SIZE_SETTINGS = useMobilePointCloudAssets
  ? { base: 1.15, min: 0.95, max: 2.40, referenceDistanceInRadii: 3.2 }
  : { base: 0.95, min: 0.80, max: 2.10, referenceDistanceInRadii: 3.0 };

const POINT_PROXY_SIZE_MULTIPLIER =
  useMobilePointCloudAssets ? 1.20 : 1.15;

let adaptivePointCloudInteractionActive = false;
let adaptivePointCloudRestoreTimer = null;

const loadedLayers = {};

let loadingTimer = null;
let modelViewerStarted = false;

const modelDisplayModes = {
  extModel: "shaded",
  intModel: "shaded"
};

const modelLayerColors = {
  extModel: "#dfddd7",
  intModel: "#dfddd7"
};

const layerOpacity = {
  extModel: 1,
  extPC: 1,
  intModel: 1,
  intPC: 1,
  leftPC: 1,
  decayBiological: 1,
  decayPatchRepair: 1,
  decayDiscoloration: 1,
  decaySoiling: 1
};

const pointDisplayModes = {
  extPC: "original",
  intPC: "original",
  leftPC: "original"
};

// User-controlled base point size, in screen pixels, for each point-cloud layer.
// The default 0.8 px keeps the viewer light while remaining readable.
const pointSizePixels = {
  extPC: 0.8,
  intPC: 0.8,
  leftPC: 0.8
};

function getPointSizePixels(layerKey) {
  const value = Number(pointSizePixels[layerKey]);
  return THREE.MathUtils.clamp(
    Number.isFinite(value) ? value : 0.8,
    0.4,
    2.4
  );
}

function updatePointSizeControlValue(layerKey) {
  const output = pointSizeValueOutputs.find(
    (item) => item.dataset.pointSizeValue === layerKey
  );

  if (output) {
    const text = `${getPointSizePixels(layerKey).toFixed(1)} px`;
    output.textContent = text;
  }
}

function applyManualPointSizeToPointObject(pointObject, layerKey) {
  if (!pointObject?.isPoints || !pointObject.material) return;

  // Draco clouds are handled by updateAdaptivePointCloudSizes().
  if (pointObject.userData.viewerSourceFormat === "drc") return;

  const materials = Array.isArray(pointObject.material)
    ? pointObject.material
    : [pointObject.material];

  materials.forEach(function (material) {
    if (!material || !("size" in material)) return;
    material.size = getPointSizePixels(layerKey);
    material.needsUpdate = true;
  });
}

function renderPointSizeChangeImmediately() {
  // Do not wait for the throttled idle render. The slider should feel live.
  window.requestAnimationFrame(function () {
    updateAdaptivePointCloudSizes();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });
}

function applyPointSizeControlToLayer(layerKey) {
  const layer = loadedLayers[layerKey];
  if (!layer) {
    renderPointSizeChangeImmediately();
    return;
  }

  if (layer.userData.viewerSourceFormat === "drc") {
    updateAdaptivePointCloudSizes();
  } else {
    layer.traverse(function (object) {
      applyManualPointSizeToPointObject(object, layerKey);
    });
  }

  renderPointSizeChangeImmediately();
}

const decayLayerKeys = [
  "decayBiological",
  "decayPatchRepair",
  "decayDiscoloration",
  "decaySoiling"
];

const decayLayerColors = {
  decayBiological: "#000000",
  decayPatchRepair: "#000000",
  decayDiscoloration: "#000000",
  decaySoiling: "#000000"
};


const decayInformation = {
  decayBiological: {
    title: "Biological Colonisation",
    description: "A visible surface condition classified by the operator on the north-western façade and mapped as an independent decay layer from the metrically controlled orthophoto.",
    causes: "Persistent moisture, sheltered exposure and slow drying are plausible factors that can favour biological growth; the exact cause requires on-site diagnosis.",
    identification: "The thesis does not treat RGB similarity as an autonomous diagnosis. The degradation class was first defined through expert interpretation, while Grasshopper supported repeatable colour sampling, boundary extraction and transfer to the 3D façade.",
    treatment: "Indicatively, identify and reduce the moisture source first, then test the least aggressive compatible cleaning method. Any biocidal treatment should only follow confirmation of active growth and local compatibility tests."
  },
  decayPatchRepair: {
    title: "Patch Repair",
    description: "A locally altered surface interpreted as a previous repair or infill and organised as a separate condition class within the façade mapping.",
    causes: "Earlier maintenance, local material replacement, crack filling or mortar repairs can create differences in colour, texture and surface continuity.",
    identification: "The class was defined by expert reading of visible discontinuities before the computational stage. Grasshopper then extracted and projected the interpreted limits; it did not determine the repair history by itself.",
    treatment: "Indicatively, retain stable and compatible repairs. Check adhesion, permeability and material compatibility before deciding whether a patch should be conserved, locally repaired or replaced."
  },
  decayDiscoloration: {
    title: "Discoloration",
    description: "A visible variation in wall finish or surface colour. The thesis notes that such variations can support the reading of different construction, maintenance and weathering phases.",
    causes: "Possible factors include moisture, differential weathering, previous treatments, staining, salts or biological activity; colour alone cannot establish the cause.",
    identification: "The mapped areas correspond to chromatic differences interpreted on the orthophoto. As stated in the thesis, similar RGB values can represent different conditions, so the computational output must be checked against survey evidence and specialist assessment.",
    treatment: "Indicatively, diagnose the source before cleaning. Use small compatibility tests and avoid aggressive treatment or forced visual uniformity where the historic surface is stable."
  },
  decaySoiling: {
    title: "Soiling",
    description: "A superficial darkening or deposit pattern interpreted on the façade surface and mapped as one of the four degradation classes used in the thesis workflow.",
    causes: "Atmospheric deposition, sheltered accumulation, runoff patterns, surface roughness and local moisture may contribute, but the specific mechanism requires direct inspection.",
    identification: "The class was first defined by expert interpretation of the visible façade condition. Grasshopper then supported the repeatable extraction of the mapped boundary from the reference raster and its projection onto the 3D model.",
    treatment: "Indicatively, begin with the least aggressive dry or low-impact cleaning tests. Escalate only after compatibility testing and address environmental conditions that may favour renewed deposition."
  }
};

function openDecayInformation(layerKey) {
  const info = decayInformation[layerKey];
  if (!info || !analysisInspector || !analysisInspectorBody) return;

  analysisInspectorKicker.textContent = "CONDITION INFORMATION";
  analysisInspectorTitle.textContent = info.title;
  analysisInspectorBody.replaceChildren();

  [
    ["Description", info.description],
    ["Probable causes", info.causes],
    ["Why it was identified", info.identification],
    ["Indicative treatment", info.treatment]
  ].forEach(function ([heading, text]) {
    const h4 = document.createElement("h4");
    h4.textContent = heading;
    const p = document.createElement("p");
    p.textContent = text;
    analysisInspectorBody.append(h4, p);
  });

  const caution = document.createElement("p");
  caution.className = "analysis-caution";
  caution.textContent = "Treatment proposals are preliminary and must be confirmed through on-site diagnosis, material compatibility tests and conservation assessment before intervention.";
  analysisInspectorBody.appendChild(caution);

  analysisInspector.classList.add("is-open");
  analysisInspector.setAttribute("aria-hidden", "false");
}

function closeDecayInformation() {
  if (!analysisInspector) return;
  analysisInspector.classList.remove("is-open");
  analysisInspector.setAttribute("aria-hidden", "true");
}

const decayOutlineExtraThickness =
  0;

let decayLineThickness =
  0.8;

const INTERIOR_POINT_KEEP_RATIO =
  0.5;

const meshColorPalette = [
  0xb86f52,
  0xc39a54,
  0x78927d,
  0x6f879a,
  0x9a7181,
  0xbaa27a,
  0x5f8e91,
  0x8d806f,
  0x7f7595,
  0xa06f5f
];


// ==================================
// LOADING MESSAGE
// ==================================

function showLoading(
  message
) {

  if (!loadingElement) {
    return;
  }

  clearTimeout(
    loadingTimer
  );

  loadingElement.style.display =
    "block";

  loadingElement.textContent =
    message;
}


function hideLoading(
  delay = 600
) {

  if (!loadingElement) {
    return;
  }

  clearTimeout(
    loadingTimer
  );

  loadingTimer =
    setTimeout(
      function () {

        loadingElement.style.display =
          "none";

      },
      delay
    );
}


// ==================================
// LAYER TYPES
// ==================================

function isModelLayer(
  layerKey
) {

  return (
    layerKey === "extModel" ||
    layerKey === "intModel"
  );

}


function isPointCloudLayer(
  layerKey
) {

  return (
    layerKey === "extPC" ||
    layerKey === "intPC" ||
    layerKey === "leftPC"
  );

}


function isDecayLayer(
  layerKey
) {

  return decayLayerKeys.includes(
    layerKey
  );
}


function isAnalysisMeshLayer(
  layerKey
) {

  return isDecayLayer(
    layerKey
  );
}


// ==================================
// VISIBLE GEOMETRY BOUNDS
// ==================================

function getVisibleGeometryBounds() {

  const totalBox =
    new THREE.Box3();

  let hasVisibleGeometry =
    false;


  Object.values(
    loadedLayers
  ).forEach(
    function (object) {

      if (!object.visible) {
        return;
      }


      const objectBox =
        new THREE.Box3()
          .setFromObject(
            object
          );


      if (
        !objectBox.isEmpty()
      ) {

        totalBox.union(
          objectBox
        );

        hasVisibleGeometry =
          true;
      }

    }
  );


  return hasVisibleGeometry
    ? totalBox
    : null;
}


// ==================================
// FIXED WORLD GROUND GRID
// ==================================
// This grid is a permanent scene reference. It does NOT read bounds from
// Exterior, Interior, point clouds, decay layers, or any other layer.
// Layer visibility can never move, resize, rebuild, show, or hide it.
// Only the Ground button controls visibility.

const groundGroup =
  new THREE.Group();

scene.add(
  groundGroup
);

let groundEnabled =
  true;

let groundLevelY =
  -0.03;

let groundInitialized =
  false;

// Project-wide fixed grid settings, in the same world coordinates as the
// Three.js viewer. Change these constants only if you intentionally want a
// different permanent project grid.
const FIXED_GROUND_GRID_SIZE = 120;
const FIXED_GROUND_GRID_DIVISIONS = 60;
const FIXED_GROUND_GRID_CENTER_X = 0;
const FIXED_GROUND_GRID_CENTER_Z = 0;
const FIXED_GROUND_GRID_Y = -0.03;


function disposeGroundObjects() {

  groundGroup.children
    .slice()
    .forEach(
      function (child) {

        groundGroup.remove(
          child
        );

        if (child.geometry) {
          child.geometry.dispose();
        }

        if (child.material) {

          const materials =
            Array.isArray(
              child.material
            )
              ? child.material
              : [child.material];

          materials.forEach(
            function (material) {
              material.dispose();
            }
          );
        }

      }
    );
}


function updateGroundPlane() {

  // The grid is created once from fixed constants, never from layer bounds.
  if (!groundInitialized) {

    disposeGroundObjects();

    groundLevelY =
      FIXED_GROUND_GRID_Y;

    const grid =
      new THREE.GridHelper(
        FIXED_GROUND_GRID_SIZE,
        FIXED_GROUND_GRID_DIVISIONS,
        0x6f757c,
        0x555a60
      );

    grid.position.set(
      FIXED_GROUND_GRID_CENTER_X,
      FIXED_GROUND_GRID_Y,
      FIXED_GROUND_GRID_CENTER_Z
    );

    grid.material.transparent =
      true;

    grid.material.opacity =
      0.42;

    grid.material.depthTest =
      true;

    grid.material.depthWrite =
      false;

    groundGroup.add(
      grid
    );

    groundInitialized =
      true;
  }

  groundGroup.visible =
    groundEnabled;
}


function updateGroundVisibilityForCamera() {

  // Kept for the existing render loop, but it never inspects the camera or
  // any layer. Ground visibility belongs exclusively to its own button.
  groundGroup.visible =
    groundEnabled &&
    groundInitialized;
}


function setGroundEnabled(
  enabled
) {

  groundEnabled =
    enabled;

  if (!groundInitialized) {
    updateGroundPlane();
  }

  updateGroundVisibilityForCamera();


  if (toggleGroundButton) {

    toggleGroundButton.classList.toggle(
      "is-active",
      enabled
    );

    toggleGroundButton.setAttribute(
      "aria-pressed",
      String(enabled)
    );
  }
}

// Create it immediately. No model or point cloud needs to load first.
updateGroundPlane();


// ==================================
// SECTION BOX — ORIENTED FACE ARROWS
// ==================================

const sectionBox = new THREE.Group();
sectionBox.name = "SectionBox";
scene.add(sectionBox);

const sectionBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sectionBoxFill = new THREE.Mesh(
  sectionBoxGeometry,
  new THREE.MeshBasicMaterial({
    color: 0x7a1f1f,
    transparent: true,
    opacity: 0.022,
    side: THREE.DoubleSide,
    depthWrite: false
  })
);
sectionBox.add(sectionBoxFill);

const sectionBoxEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(sectionBoxGeometry),
  new THREE.LineBasicMaterial({
    color: 0x7a1f1f,
    transparent: true,
    opacity: 0.92,
    depthTest: false
  })
);
sectionBoxEdges.renderOrder = 20;
sectionBox.add(sectionBoxEdges);
sectionBox.visible = false;

const sectionPlanes = [
  new THREE.Plane(), new THREE.Plane(), new THREE.Plane(),
  new THREE.Plane(), new THREE.Plane(), new THREE.Plane()
];

let sectionBoxEnabled = false;
let sectionBoxInitialized = false;
let minimumSectionDimension = 0.001;

function forEachObjectMaterial(object, callback) {
  if (!object.material) return;
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  materials.forEach(function (material) {
    if (material) callback(material);
  });
}

function applyClippingToMaterial(material) {
  material.clippingPlanes = sectionBoxEnabled ? sectionPlanes : null;
  material.clipIntersection = false;
  material.clipShadows = false;
  material.needsUpdate = true;
}

function applyClippingToObject(object) {
  object.traverse(function (child) {
    forEachObjectMaterial(child, applyClippingToMaterial);
  });
}

function applyClippingToAllLayers() {
  const processedMaterials = new Set();
  Object.values(loadedLayers).forEach(function (object) {
    object.traverse(function (child) {
      forEachObjectMaterial(child, function (material) {
        if (processedMaterials.has(material)) return;
        processedMaterials.add(material);
        applyClippingToMaterial(material);
      });
    });
  });
}

function updateSectionClippingPlanes() {
  if (!sectionBoxEnabled) return;

  sectionBox.updateMatrixWorld(true);
  const center = sectionBox.getWorldPosition(new THREE.Vector3());
  const quaternion = sectionBox.getWorldQuaternion(new THREE.Quaternion());
  const worldScale = sectionBox.getWorldScale(new THREE.Vector3());

  const halfX = Math.abs(worldScale.x) * 0.5;
  const halfY = Math.abs(worldScale.y) * 0.5;
  const halfZ = Math.abs(worldScale.z) * 0.5;

  const axisX = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).normalize();
  const axisY = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).normalize();
  const axisZ = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize();

  const positiveXPoint = center.clone().addScaledVector(axisX, halfX);
  const negativeXPoint = center.clone().addScaledVector(axisX, -halfX);
  const positiveYPoint = center.clone().addScaledVector(axisY, halfY);
  const negativeYPoint = center.clone().addScaledVector(axisY, -halfY);
  const positiveZPoint = center.clone().addScaledVector(axisZ, halfZ);
  const negativeZPoint = center.clone().addScaledVector(axisZ, -halfZ);

  sectionPlanes[0].setFromNormalAndCoplanarPoint(axisX.clone().negate(), positiveXPoint).normalize();
  sectionPlanes[1].setFromNormalAndCoplanarPoint(axisX, negativeXPoint).normalize();
  sectionPlanes[2].setFromNormalAndCoplanarPoint(axisY.clone().negate(), positiveYPoint).normalize();
  sectionPlanes[3].setFromNormalAndCoplanarPoint(axisY, negativeYPoint).normalize();
  sectionPlanes[4].setFromNormalAndCoplanarPoint(axisZ.clone().negate(), positiveZPoint).normalize();
  sectionPlanes[5].setFromNormalAndCoplanarPoint(axisZ, negativeZPoint).normalize();
}

function collectSectionSamplePoints(modelsOnly = false, maxPoints = 60000) {
  const points = [];
  const preferredKeys = modelsOnly ? ["extModel", "intModel"] : Object.keys(loadedLayers);
  const candidates = preferredKeys
    .map(key => loadedLayers[key])
    .filter(object => object && object.visible);

  // If the model layers are hidden/not loaded, fall back to any visible geometry.
  if (modelsOnly && candidates.length === 0) {
    return collectSectionSamplePoints(false, maxPoints);
  }

  const meshes = [];
  candidates.forEach(function (object) {
    object.updateMatrixWorld(true);
    object.traverse(function (child) {
      if (child.userData?.viewerAdaptiveProxy) return;
      const position = child.geometry?.attributes?.position;
      if (position && position.count > 0) {
        meshes.push({ child, position });
      }
    });
  });

  if (meshes.length === 0) return points;

  const perMeshBudget = Math.max(80, Math.floor(maxPoints / meshes.length));
  const temp = new THREE.Vector3();

  meshes.forEach(function ({ child, position }) {
    const stride = Math.max(1, Math.ceil(position.count / perMeshBudget));
    for (let i = 0; i < position.count && points.length < maxPoints; i += stride) {
      temp.fromBufferAttribute(position, i).applyMatrix4(child.matrixWorld);
      if (Number.isFinite(temp.x) && Number.isFinite(temp.y) && Number.isFinite(temp.z)) {
        points.push(temp.clone());
      }
    }
  });

  return points;
}

function getSectionOrientation(points) {
  if (!points || points.length < 8) {
    return {
      xAxis: new THREE.Vector3(1, 0, 0),
      yAxis: new THREE.Vector3(0, 1, 0),
      zAxis: new THREE.Vector3(0, 0, 1),
      quaternion: new THREE.Quaternion()
    };
  }

  let meanX = 0;
  let meanZ = 0;
  points.forEach(function (point) {
    meanX += point.x;
    meanZ += point.z;
  });
  meanX /= points.length;
  meanZ /= points.length;

  let xx = 0;
  let xz = 0;
  let zz = 0;
  points.forEach(function (point) {
    const dx = point.x - meanX;
    const dz = point.z - meanZ;
    xx += dx * dx;
    xz += dx * dz;
    zz += dz * dz;
  });

  // Principal horizontal direction of the building footprint.
  const angle = 0.5 * Math.atan2(2 * xz, xx - zz);
  const xAxis = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const zAxis = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize();
  const basis = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);

  return { xAxis, yAxis, zAxis, quaternion };
}

function resetSectionBoxToVisibleGeometry() {
  const orientationPoints = collectSectionSamplePoints(true, 45000);
  const extentPoints = collectSectionSamplePoints(false, 80000);

  if (extentPoints.length < 2) {
    showLoading("Load a model before enabling the section box");
    hideLoading(1800);
    return false;
  }

  const { xAxis, yAxis, zAxis, quaternion } = getSectionOrientation(orientationPoints);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  extentPoints.forEach(function (point) {
    const px = point.dot(xAxis);
    const py = point.dot(yAxis);
    const pz = point.dot(zAxis);
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    minZ = Math.min(minZ, pz); maxZ = Math.max(maxZ, pz);
  });

  const sizeX = Math.max(maxX - minX, 0.001);
  const sizeY = Math.max(maxY - minY, 0.001);
  const sizeZ = Math.max(maxZ - minZ, 0.001);
  const maxDimension = Math.max(sizeX, sizeY, sizeZ, 1);
  minimumSectionDimension = Math.max(maxDimension * 0.004, 0.001);
  const padding = 1.035;

  const center = new THREE.Vector3()
    .addScaledVector(xAxis, (minX + maxX) * 0.5)
    .addScaledVector(yAxis, (minY + maxY) * 0.5)
    .addScaledVector(zAxis, (minZ + maxZ) * 0.5);

  sectionBox.position.copy(center);
  sectionBox.quaternion.copy(quaternion);
  sectionBox.scale.set(
    Math.max(sizeX * padding, minimumSectionDimension),
    Math.max(sizeY * padding, minimumSectionDimension),
    Math.max(sizeZ * padding, minimumSectionDimension)
  );
  sectionBox.updateMatrixWorld(true);
  sectionBoxInitialized = true;
  updateSectionClippingPlanes();
  updateSectionHandles();
  if (sectionBoxEnabled) updateSectionModeUI();
  return true;
}

// Six thin arrow handles. There is intentionally no centre move handle:
// dragging a face can only move that clipping face, never the whole box.
const sectionHandleGroup = new THREE.Group();
sectionHandleGroup.name = "SectionFaceArrows";
scene.add(sectionHandleGroup);
sectionHandleGroup.visible = false;

const sectionFaceHandles = [];
const sectionHandlePickTargets = [];
const sectionAxisDefinitions = [
  { axis: "x", sign: 1 }, { axis: "x", sign: -1 },
  { axis: "y", sign: 1 }, { axis: "y", sign: -1 },
  { axis: "z", sign: 1 }, { axis: "z", sign: -1 }
];

sectionAxisDefinitions.forEach(function (definition) {
  const root = new THREE.Group();
  root.userData.sectionFaceAxis = definition.axis;
  root.userData.sectionFaceSign = definition.sign;

  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(),
    1,
    0x7a1f1f,
    0.28,
    0.12
  );
  arrow.line.material.transparent = true;
  arrow.line.material.opacity = 0.92;
  arrow.line.material.depthTest = false;
  arrow.cone.material.transparent = true;
  arrow.cone.material.opacity = 0.96;
  arrow.cone.material.depthTest = false;
  arrow.line.renderOrder = 132;
  arrow.cone.renderOrder = 133;
  root.add(arrow);

  // Invisible generous pick target at the arrow head keeps the visible control thin.
  const pick = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false
    })
  );
  pick.userData.sectionFaceHandle = root;
  root.add(pick);

  root.userData.arrow = arrow;
  root.userData.pick = pick;
  sectionHandleGroup.add(root);
  sectionFaceHandles.push(root);
  sectionHandlePickTargets.push(pick);
});

const sectionHandleRaycaster = new THREE.Raycaster();
const sectionHandlePointer = new THREE.Vector2();
let sectionDragState = null;
let sectionTransformDragging = false;

let sectionInteractionMode = "resize";

const sectionTransformControls = new TransformControls(
  camera,
  renderer.domElement
);
sectionTransformControls.setSpace("local");
sectionTransformControls.setSize(0.78);
sectionTransformControls.enabled = false;
sectionTransformControls.visible = false;
const sectionTransformHelper = sectionTransformControls.getHelper();
sectionTransformHelper.visible = false;
scene.add(sectionTransformHelper);

sectionTransformControls.addEventListener("dragging-changed", function (event) {
  controls.enabled = !event.value;
  sectionTransformDragging = Boolean(event.value);

  if (sectionTransformDragging) {
    setAdaptivePointCloudInteraction(true);
  } else {
    scheduleFullPointCloudQuality();
  }
});

sectionTransformControls.addEventListener("objectChange", function () {
  if (!sectionBoxEnabled) return;
  sectionBox.updateMatrixWorld(true);
  updateSectionClippingPlanes();
  updateSectionHandles();
});

function updateSectionModeUI() {
  const isResize = sectionInteractionMode === "resize";

  sectionFaceHandles.forEach(function (handle) {
    handle.visible = isResize;
  });
  sectionHandleGroup.visible = sectionBoxEnabled && isResize;

  if (sectionInteractionMode === "move" || sectionInteractionMode === "rotate") {
    sectionTransformControls.enabled = sectionBoxEnabled;
    sectionTransformControls.visible = sectionBoxEnabled;
    sectionTransformHelper.visible = sectionBoxEnabled;
    sectionTransformControls.attach(sectionBox);
    sectionTransformControls.setSpace("local");
    sectionTransformControls.setMode(sectionInteractionMode === "move" ? "translate" : "rotate");
  } else {
    sectionTransformControls.detach();
    sectionTransformControls.enabled = false;
    sectionTransformControls.visible = false;
    sectionTransformHelper.visible = false;
  }

  sectionModeButtons.forEach(function (button) {
    button.classList.toggle(
      "is-active",
      button.dataset.sectionMode === sectionInteractionMode
    );
  });
}

function setSectionInteractionMode(mode) {
  if (!["resize", "move", "rotate"].includes(mode)) return;
  sectionInteractionMode = mode;
  updateSectionModeUI();
}

sectionModeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setSectionInteractionMode(button.dataset.sectionMode);
  });
});

if (resetSectionBoxButton) {
  resetSectionBoxButton.addEventListener("click", function () {
    if (!sectionBoxEnabled) return;
    resetSectionBoxToVisibleGeometry();
    updateSectionModeUI();
  });
}

function getSectionAxisVector(axis, sign = 1) {
  const vector = axis === "x"
    ? new THREE.Vector3(1, 0, 0)
    : axis === "y"
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);
  return vector.multiplyScalar(sign);
}

function setSectionHandlePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  sectionHandlePointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  sectionHandlePointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  sectionHandleRaycaster.setFromCamera(sectionHandlePointer, camera);
}

function updateSectionHandles() {
  if (!sectionBoxEnabled) return;
  sectionBox.updateMatrixWorld(true);

  const center = sectionBox.getWorldPosition(new THREE.Vector3());
  const quaternion = sectionBox.getWorldQuaternion(new THREE.Quaternion());
  const scale = sectionBox.getWorldScale(new THREE.Vector3());
  const sceneScale = Math.max(getMeasurementSceneScale(), 0.001);
  const cameraDistance = Math.max(camera.position.distanceTo(center), 0.001);
  const visualScale = THREE.MathUtils.clamp(
    cameraDistance * 0.010,
    sceneScale * 0.004,
    sceneScale * 0.030
  );

  sectionFaceHandles.forEach(function (root) {
    const axis = root.userData.sectionFaceAxis;
    const sign = root.userData.sectionFaceSign;
    const outward = getSectionAxisVector(axis, sign).applyQuaternion(quaternion).normalize();
    const halfDimension = Math.abs(scale[axis]) * 0.5;
    const facePoint = center.clone().addScaledVector(outward, halfDimension);
    const arrow = root.userData.arrow;
    const pick = root.userData.pick;

    root.position.copy(facePoint);
    arrow.position.set(0, 0, 0);
    arrow.setDirection(outward);
    arrow.setLength(visualScale * 2.35, visualScale * 0.72, visualScale * 0.30);
    // A generous invisible hit volume covers the shaft and head, not only the tip.
    pick.position.copy(outward).multiplyScalar(visualScale * 1.28);
    pick.scale.setScalar(visualScale * 1.45);
  });

  // Pointer interaction can happen between render frames. Keep the raycast matrices current.
  sectionHandleGroup.updateMatrixWorld(true);
}

function createAxisDragPlane(axisWorld, facePoint) {
  const cameraDirection = camera.getWorldDirection(new THREE.Vector3()).normalize();
  let side = new THREE.Vector3().crossVectors(cameraDirection, axisWorld);

  if (side.lengthSq() < 1e-6) {
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
    side.crossVectors(cameraUp, axisWorld);
  }
  if (side.lengthSq() < 1e-6) {
    side.crossVectors(new THREE.Vector3(1, 0, 0), axisWorld);
  }

  side.normalize();
  const planeNormal = new THREE.Vector3().crossVectors(axisWorld, side).normalize();
  return new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, facePoint);
}

function distancePointToSegment2D(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSq = abx * abx + aby * aby;

  if (lengthSq <= 1e-8) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = THREE.MathUtils.clamp(
    ((px - ax) * abx + (py - ay) * aby) / lengthSq,
    0,
    1
  );

  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
}

function getSectionHandleScreenHit(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const boxQuaternion = sectionBox.getWorldQuaternion(new THREE.Quaternion());
  const cameraDistance = Math.max(
    camera.position.distanceTo(sectionBox.getWorldPosition(new THREE.Vector3())),
    0.001
  );
  const sceneScale = Math.max(getMeasurementSceneScale(), 0.001);
  const visualScale = THREE.MathUtils.clamp(
    cameraDistance * 0.010,
    sceneScale * 0.004,
    sceneScale * 0.030
  );

  let nearestHandle = null;
  let nearestDistance = Infinity;
  const hitRadiusPx = 26;

  sectionFaceHandles.forEach(function (root) {
    if (!root.visible) return;

    const startWorld = root.getWorldPosition(new THREE.Vector3());
    const outward = getSectionAxisVector(
      root.userData.sectionFaceAxis,
      root.userData.sectionFaceSign
    ).applyQuaternion(boxQuaternion).normalize();
    const endWorld = startWorld.clone().addScaledVector(outward, visualScale * 2.45);

    const startNdc = startWorld.clone().project(camera);
    const endNdc = endWorld.clone().project(camera);

    if (startNdc.z < -1 || startNdc.z > 1 || endNdc.z < -1 || endNdc.z > 1) return;

    const ax = (startNdc.x * 0.5 + 0.5) * rect.width;
    const ay = (-startNdc.y * 0.5 + 0.5) * rect.height;
    const bx = (endNdc.x * 0.5 + 0.5) * rect.width;
    const by = (-endNdc.y * 0.5 + 0.5) * rect.height;
    const distance = distancePointToSegment2D(pointerX, pointerY, ax, ay, bx, by);

    if (distance <= hitRadiusPx && distance < nearestDistance) {
      nearestDistance = distance;
      nearestHandle = root;
    }
  });

  return nearestHandle;
}

function getSectionHandleHit(event) {
  setSectionHandlePointer(event);
  sectionHandleGroup.updateMatrixWorld(true);

  const hits = sectionHandleRaycaster.intersectObject(sectionHandleGroup, true);

  for (const hit of hits) {
    let object = hit.object;

    while (object && object !== sectionHandleGroup) {
      if (object.userData.sectionFaceHandle) {
        return object.userData.sectionFaceHandle;
      }
      if (object.userData.sectionFaceAxis && object.userData.sectionFaceSign) {
        return object;
      }
      object = object.parent;
    }
  }

  // Screen-space fallback: makes the arrows easy to hover and grab even when
  // the invisible 3D hit mesh is visually tiny at the current camera angle.
  return getSectionHandleScreenHit(event);
}

function beginSectionFaceDrag(event, handleRoot) {
  setSectionHandlePointer(event);

  const axis = handleRoot.userData.sectionFaceAxis;
  const sign = handleRoot.userData.sectionFaceSign;
  const quaternion = sectionBox.getWorldQuaternion(new THREE.Quaternion());
  const axisWorld = getSectionAxisVector(axis, sign).applyQuaternion(quaternion).normalize();
  const scale = sectionBox.getWorldScale(new THREE.Vector3());
  const dimension = Math.abs(scale[axis]);
  const center = sectionBox.getWorldPosition(new THREE.Vector3());
  const facePoint = center.clone().addScaledVector(axisWorld, dimension * 0.5);
  const dragPlane = createAxisDragPlane(axisWorld, facePoint);
  const startPoint = new THREE.Vector3();

  if (!sectionHandleRaycaster.ray.intersectPlane(dragPlane, startPoint)) {
    return false;
  }

  sectionDragState = {
    axis,
    axisWorld,
    dragPlane,
    startPoint,
    startCenter: sectionBox.position.clone(),
    startDimension: dimension
  };

  controls.enabled = false;
  renderer.domElement.setPointerCapture(event.pointerId);
  renderer.domElement.style.cursor = "grabbing";
  return true;
}

renderer.domElement.addEventListener("pointerdown", function (event) {
  if (!sectionBoxEnabled || measurementMode || sectionInteractionMode !== "resize") return;

  const handleRoot = getSectionHandleHit(event);
  if (!handleRoot) return;

  if (beginSectionFaceDrag(event, handleRoot)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}, true);

renderer.domElement.addEventListener("pointermove", function (event) {
  if (sectionDragState) {
    setSectionHandlePointer(event);
    const currentPoint = new THREE.Vector3();

    if (sectionHandleRaycaster.ray.intersectPlane(sectionDragState.dragPlane, currentPoint)) {
      const requestedDelta = currentPoint
        .sub(sectionDragState.startPoint)
        .dot(sectionDragState.axisWorld);

      const newDimension = Math.max(
        minimumSectionDimension,
        sectionDragState.startDimension + requestedDelta
      );
      const appliedDelta = newDimension - sectionDragState.startDimension;

      // Moving one face requires the centre to shift by half the face movement;
      // the opposite face therefore stays exactly fixed.
      sectionBox.scale[sectionDragState.axis] = newDimension;
      sectionBox.position.copy(sectionDragState.startCenter)
        .addScaledVector(sectionDragState.axisWorld, appliedDelta * 0.5);

      sectionBox.updateMatrixWorld(true);
      updateSectionClippingPlanes();
      updateSectionHandles();
    }

    event.preventDefault();
    return;
  }

  if (!sectionBoxEnabled || measurementMode || sectionInteractionMode !== "resize") {
    if (!sectionDragState) renderer.domElement.style.cursor = "";
    return;
  }

  const handleRoot = getSectionHandleHit(event);
  renderer.domElement.style.cursor = handleRoot ? "grab" : "";
}, true);

function endSectionDrag(event) {
  if (!sectionDragState) return;
  sectionDragState = null;
  controls.enabled = true;
  renderer.domElement.style.cursor = "";
  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId);
  }
}

renderer.domElement.addEventListener("pointerup", endSectionDrag, true);
renderer.domElement.addEventListener("pointercancel", endSectionDrag, true);

function setSectionBoxEnabled(enabled) {
  if (enabled && !sectionBoxInitialized) {
    const initialized = resetSectionBoxToVisibleGeometry();
    if (!initialized) {
      sectionBoxEnabled = false;
      if (toggleSectionButton) {
        toggleSectionButton.classList.remove("is-active");
        toggleSectionButton.setAttribute("aria-pressed", "false");
      }
      return;
    }
  }

  sectionBoxEnabled = enabled;
  sectionBox.visible = enabled;

  if (sectionModeToolbar) {
    sectionModeToolbar.classList.toggle("is-open", enabled);
    sectionModeToolbar.setAttribute("aria-hidden", String(!enabled));
  }

  if (enabled) {
    updateSectionClippingPlanes();
    updateSectionHandles();
    updateSectionModeUI();
  } else {
    sectionDragState = null;
    controls.enabled = true;
    renderer.domElement.style.cursor = "";
    sectionHandleGroup.visible = false;
    sectionTransformControls.detach();
    sectionTransformControls.enabled = false;
    sectionTransformControls.visible = false;
    sectionTransformHelper.visible = false;
  }

  applyClippingToAllLayers();

  if (toggleSectionButton) {
    toggleSectionButton.classList.toggle("is-active", enabled);
    toggleSectionButton.setAttribute("aria-pressed", String(enabled));
  }
}

// ==================================
// MODEL DISPLAY MODES
// ==================================

function cloneMaterialCollection(
  material
) {

  if (Array.isArray(material)) {

    return material.map(
      function (item) {

        return item
          ? item.clone()
          : null;

      }
    );
  }


  return material
    ? material.clone()
    : null;
}


function disposeGeneratedMaterial(
  material
) {

  const materials =
    Array.isArray(material)
      ? material
      : [material];


  materials.forEach(
    function (item) {

      if (
        item &&
        item.userData &&
        item.userData.viewerGenerated
      ) {
        item.dispose();
      }

    }
  );
}


function getMeshDisplayColor(
  mesh,
  layerKey
) {

  if (
    mesh.userData.viewerMeshColor !==
    undefined
  ) {

    return mesh.userData.viewerMeshColor;
  }


  const source =
    `${layerKey}:${mesh.name}:${mesh.userData.viewerMeshIndex}`;

  let hash = 0;

  for (
    let index = 0;
    index < source.length;
    index++
  ) {

    hash =
      ((hash << 5) - hash) +
      source.charCodeAt(index);

    hash |= 0;
  }


  const paletteIndex =
    Math.abs(hash) %
    meshColorPalette.length;

  mesh.userData.viewerMeshColor =
    meshColorPalette[paletteIndex];

  return mesh.userData.viewerMeshColor;
}


function createGeneratedMaterial(
  mode,
  mesh,
  layerKey
) {

  let material = null;


  if (mode === "wireframe") {

    material =
      new THREE.MeshBasicMaterial({

        color:
          modelLayerColors[layerKey] || "#dfddd7",

        wireframe:
          true,

        transparent:
          false,

        side:
          THREE.DoubleSide

      });

  } else if (mode === "meshColors") {

    material =
      new THREE.MeshStandardMaterial({

        color:
          getMeshDisplayColor(
            mesh,
            layerKey
          ),

        roughness:
          0.76,

        metalness:
          0,

        side:
          THREE.DoubleSide

      });

  } else {

    material =
      new THREE.MeshStandardMaterial({

        color:
          modelLayerColors[layerKey] || "#dfddd7",

        roughness:
          0.78,

        metalness:
          0,

        side:
          THREE.DoubleSide

      });
  }


  material.userData.viewerGenerated =
    true;

  applyClippingToMaterial(
    material
  );

  return material;
}


function createGeneratedMaterialCollection(
  mesh,
  layerKey,
  mode
) {

  const originalMaterial =
    mesh.userData.viewerOriginalMaterial;

  const slotCount =
    Array.isArray(originalMaterial)
      ? Math.max(originalMaterial.length, 1)
      : 1;

  const materials = [];


  for (
    let index = 0;
    index < slotCount;
    index++
  ) {

    materials.push(
      createGeneratedMaterial(
        mode,
        mesh,
        layerKey
      )
    );
  }


  return Array.isArray(originalMaterial)
    ? materials
    : materials[0];
}


function createOriginalMaterialCollection(
  mesh
) {

  const originalMaterial =
    mesh.userData.viewerOriginalMaterial;

  const clonedMaterial =
    cloneMaterialCollection(
      originalMaterial
    );


  const materials =
    Array.isArray(clonedMaterial)
      ? clonedMaterial
      : [clonedMaterial];


  materials.forEach(
    function (material) {

      if (!material) {
        return;
      }

      if (
        "side" in material
      ) {
        material.side =
          THREE.DoubleSide;
      }

      material.userData.viewerGenerated =
        true;

      applyClippingToMaterial(
        material
      );

    }
  );


  return clonedMaterial;
}


function applyDisplayModeToMesh(
  mesh,
  layerKey,
  mode
) {

  disposeGeneratedMaterial(
    mesh.material
  );


  mesh.material =
    mode === "original"
      ? createOriginalMaterialCollection(
          mesh
        )
      : createGeneratedMaterialCollection(
          mesh,
          layerKey,
          mode
        );
}


function setModelDisplayMode(
  layerKey,
  mode
) {

  if (!isModelLayer(layerKey)) {
    return;
  }


  modelDisplayModes[layerKey] =
    mode;


  const model =
    loadedLayers[layerKey];

  if (!model) {
    return;
  }


  model.traverse(
    function (object) {

      if (
        object.isMesh &&
        !object.userData.viewerDisplayHelper
      ) {

        applyDisplayModeToMesh(
          object,
          layerKey,
          mode
        );
      }

    }
  );


  applyLayerOpacity(layerKey);
}



// ==================================
// LAYER APPEARANCE CONTROLS
// ==================================

function rememberMaterialTransparency(material) {
  if (!material || !material.userData) return;
  if (material.userData.viewerBaseOpacity === undefined) {
    material.userData.viewerBaseOpacity = Number.isFinite(material.opacity) ? material.opacity : 1;
    material.userData.viewerBaseTransparent = Boolean(material.transparent);
    material.userData.viewerBaseDepthWrite = material.depthWrite !== false;
  }
}

function applyOpacityToMaterial(material, opacity) {
  if (!material) return;
  rememberMaterialTransparency(material);
  const baseOpacity = material.userData.viewerBaseOpacity ?? 1;
  const finalOpacity = THREE.MathUtils.clamp(baseOpacity * opacity, 0, 1);
  material.opacity = finalOpacity;
  material.transparent = Boolean(material.userData.viewerBaseTransparent) || finalOpacity < 0.999;
  material.depthWrite = material.transparent ? false : Boolean(material.userData.viewerBaseDepthWrite);
  material.needsUpdate = true;
}

function applyLayerOpacity(layerKey) {
  const layer = loadedLayers[layerKey];
  if (!layer) return;
  const opacity = THREE.MathUtils.clamp(layerOpacity[layerKey] ?? 1, 0, 1);
  layer.traverse(function (object) {
    forEachObjectMaterial(object, function (material) {
      applyOpacityToMaterial(material, opacity);

      // Give architectural model polygons a small depth-buffer offset.
      // Geometry is NOT moved. This only resolves nearly-coplanar model +
      // survey-point rendering, with a stronger separation on mobile GPUs.
      if (isModelLayer(layerKey) && object.isMesh) {
        material.polygonOffset = true;
        material.polygonOffsetFactor = mobileLayoutQuery.matches ? 2 : 1;
        material.polygonOffsetUnits = mobileLayoutQuery.matches ? 8 : 2;
        material.needsUpdate = true;
      }
    });
  });

  if (layer.userData.viewerJsonDecayLayer && layer.userData.viewerInnerMaterial) {
    applyOpacityToMaterial(layer.userData.viewerInnerMaterial, opacity);
  }
}

function setLayerOpacity(layerKey, opacity) {
  layerOpacity[layerKey] = THREE.MathUtils.clamp(Number(opacity), 0, 1);
  applyLayerOpacity(layerKey);
}

function setModelLayerColor(layerKey, colorValue) {
  if (!isModelLayer(layerKey)) return;
  modelLayerColors[layerKey] = colorValue;

  // A manual colour choice means the user wants a uniform model colour.
  modelDisplayModes[layerKey] = "shaded";
  const select = document.querySelector(`[data-display-mode="${layerKey}"]`);
  if (select) select.value = "shaded";
  setModelDisplayMode(layerKey, "shaded");
  applyLayerOpacity(layerKey);
}

// ==================================
// AUTOMATIC MODEL / POINT-CLOUD OPACITY
// ==================================

// Exterior Model pairs with both exterior point-cloud layers.
// Interior Model pairs with the interior point cloud.
const modelPointCloudOpacityPairs = {
  extModel: ["extPC", "leftPC"],
  intModel: ["intPC"]
};

const automaticModelOpacityState = {
  extModel: { active: false, previousOpacity: 1 },
  intModel: { active: false, previousOpacity: 1 }
};

function syncLayerOpacityControl(layerKey) {
  const input = document.querySelector(`[data-layer-opacity="${layerKey}"]`);
  const valueLabel = document.querySelector(`[data-opacity-value="${layerKey}"]`);
  const opacity = THREE.MathUtils.clamp(layerOpacity[layerKey] ?? 1, 0, 1);

  if (input) {
    input.value = String(opacity);
  }

  if (valueLabel) {
    valueLabel.textContent = `${Math.round(opacity * 100)}%`;
  }
}

function updateAutomaticModelPointCloudOpacity() {
  Object.entries(modelPointCloudOpacityPairs).forEach(function ([modelKey, pointCloudKeys]) {
    const state = automaticModelOpacityState[modelKey];
    const model = loadedLayers[modelKey];
    const modelVisible = Boolean(model && model.visible);
    const matchingPointCloudVisible = pointCloudKeys.some(function (pointCloudKey) {
      const pointCloud = loadedLayers[pointCloudKey];
      return Boolean(pointCloud && pointCloud.visible);
    });

    const shouldUseAutomaticOpacity = modelVisible && matchingPointCloudVisible;

    if (shouldUseAutomaticOpacity && !state.active) {
      state.previousOpacity = THREE.MathUtils.clamp(layerOpacity[modelKey] ?? 1, 0, 1);
      state.active = true;
      layerOpacity[modelKey] = 0.5;
      syncLayerOpacityControl(modelKey);
      applyLayerOpacity(modelKey);
      return;
    }

    if (!shouldUseAutomaticOpacity && state.active) {
      state.active = false;
      layerOpacity[modelKey] = state.previousOpacity;
      syncLayerOpacityControl(modelKey);
      applyLayerOpacity(modelKey);
    }
  });
}


// ==================================
// ANALYSIS LAYER DISPLAY
// ==================================

/*
Rhino curves exported to GLB are commonly
loaded as Line, LineSegments, or Points.
Normal WebGL lines are often limited to one
pixel, so the analysis curves are rebuilt as
screen-space fat lines with a light outline.
*/

const analysisLineMaterials =
  new Set();

let analysisPointTexture =
  null;


function isAnalysisDrawableObject(
  object
) {

  return Boolean(
    object &&
    (
      object.isMesh ||
      object.isLine ||
      object.isLineSegments ||
      object.isPoints
    )
  );
}


function getOriginalMaterialColor(
  object,
  fallback = 0xffffff
) {

  const sourceMaterial =
    Array.isArray(
      object.userData.viewerOriginalMaterial
    )
      ? object.userData.viewerOriginalMaterial[0]
      : object.userData.viewerOriginalMaterial;


  if (
    sourceMaterial &&
    sourceMaterial.color
  ) {

    return sourceMaterial.color.clone();
  }


  return new THREE.Color(
    fallback
  );
}


function markGeneratedAnalysisMaterial(
  material
) {

  material.userData.viewerGenerated =
    true;

  applyClippingToMaterial(
    material
  );

  return material;
}


function getAnalysisRenderSize() {

  const width =
    Math.max(
      viewer.clientWidth ||
        window.innerWidth,
      1
    );

  const height =
    Math.max(
      viewer.clientHeight ||
        window.innerHeight,
      1
    );


  return {
    width,
    height
  };
}


function updateAnalysisLineMaterialResolutions() {

  const size =
    getAnalysisRenderSize();


  analysisLineMaterials.forEach(
    function (material) {

      if (
        material &&
        material.resolution
      ) {

        material.resolution.set(
          size.width,
          size.height
        );
      }

    }
  );
}


function createFatLineMaterial({
  color = 0x000000,
  linewidth = 2.4,
  vertexColors = false,
  opacity = 1,
  depthTest = false
} = {}) {

  const material =
    new LineMaterial({

      color:
        color,

      linewidth:
        linewidth,

      vertexColors:
        vertexColors,

      worldUnits:
        false,

      transparent:
        opacity < 1,

      opacity:
        opacity,

      depthTest:
        depthTest,

      depthWrite:
        false,

      alphaToCoverage:
        true

    });


  const size =
    getAnalysisRenderSize();


  material.resolution.set(
    size.width,
    size.height
  );


  analysisLineMaterials.add(
    material
  );


  return markGeneratedAnalysisMaterial(
    material
  );
}


function disposeAnalysisHelperObject(
  helper
) {

  helper.traverse(
    function (child) {

      if (child.geometry) {
        child.geometry.dispose();
      }


      const materials =
        Array.isArray(child.material)
          ? child.material
          : child.material
            ? [child.material]
            : [];


      materials.forEach(
        function (material) {

          analysisLineMaterials.delete(
            material
          );

          if (material.map) {
            material.map.dispose();
          }

          material.dispose();

        }
      );

    }
  );
}


function removeAnalysisVisibilityHelper(
  object
) {

  const helpers =
    object.children.filter(
      function (child) {

        return Boolean(
          child.userData.viewerAnalysisVisibilityHelper
        );

      }
    );


  helpers.forEach(
    function (helper) {

      object.remove(
        helper
      );

      disposeAnalysisHelperObject(
        helper
      );

    }
  );
}


function setObjectMaterialVisible(
  object,
  visible
) {

  const materials =
    Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];


  materials.forEach(
    function (material) {

      material.visible =
        visible;

    }
  );
}


function getOrderedGeometryData(
  object
) {

  if (
    !object.geometry
  ) {
    return null;
  }


  const positionAttribute =
    object.geometry.getAttribute(
      "position"
    );


  if (
    !positionAttribute ||
    positionAttribute.count === 0
  ) {
    return null;
  }


  const colorAttribute =
    object.geometry.getAttribute(
      "color"
    );


  const indexAttribute =
    object.geometry.index;


  const orderedIndices =
    indexAttribute
      ? Array.from(
          indexAttribute.array
        )
      : Array.from(
          {
            length:
              positionAttribute.count
          },
          function (_, index) {
            return index;
          }
        );


  if (
    object.isLineLoop &&
    orderedIndices.length > 1
  ) {

    orderedIndices.push(
      orderedIndices[0]
    );
  }


  const positions = [];
  const colors = [];


  orderedIndices.forEach(
    function (sourceIndex) {

      positions.push(
        positionAttribute.getX(
          sourceIndex
        ),
        positionAttribute.getY(
          sourceIndex
        ),
        positionAttribute.getZ(
          sourceIndex
        )
      );


      if (colorAttribute) {

        colors.push(
          colorAttribute.getX(
            sourceIndex
          ),
          colorAttribute.getY(
            sourceIndex
          ),
          colorAttribute.getZ(
            sourceIndex
          )
        );
      }

    }
  );


  return {
    positions,
    colors,
    hasVertexColors:
      Boolean(colorAttribute)
  };
}


function createFatLineObject(
  sourceObject,
  color,
  linewidth,
  useVertexColors = false
) {

  const data =
    getOrderedGeometryData(
      sourceObject
    );


  if (
    !data ||
    data.positions.length < 6
  ) {
    return null;
  }


  const useSegments =
    Boolean(
      sourceObject.isLineSegments
    );


  const geometry =
    useSegments
      ? new LineSegmentsGeometry()
      : new LineGeometry();


  geometry.setPositions(
    data.positions
  );


  if (
    useVertexColors &&
    data.hasVertexColors &&
    data.colors.length ===
      data.positions.length
  ) {

    geometry.setColors(
      data.colors
    );
  }


  const material =
    createFatLineMaterial({

      color:
        color,

      linewidth:
        linewidth,

      vertexColors:
        useVertexColors &&
        data.hasVertexColors,

      depthTest:
        false

    });


  const line =
    useSegments
      ? new LineSegments2(
          geometry,
          material
        )
      : new Line2(
          geometry,
          material
        );


  line.computeLineDistances();

  line.frustumCulled =
    false;

  line.raycast =
    function () {};


  return line;
}


function getCircularPointTexture() {

  if (analysisPointTexture) {
    return analysisPointTexture;
  }


  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    64;

  canvas.height =
    64;


  const context =
    canvas.getContext(
      "2d"
    );


  context.clearRect(
    0,
    0,
    64,
    64
  );

  context.fillStyle =
    "#ffffff";

  context.beginPath();

  context.arc(
    32,
    32,
    29,
    0,
    Math.PI * 2
  );

  context.fill();


  analysisPointTexture =
    new THREE.CanvasTexture(
      canvas
    );


  return analysisPointTexture;
}


function createCircularPointHelper(
  sourceObject,
  color,
  size
) {

  if (
    !sourceObject.geometry ||
    !sourceObject.geometry.getAttribute(
      "position"
    )
  ) {
    return null;
  }


  const geometry =
    sourceObject.geometry.clone();


  const material =
    markGeneratedAnalysisMaterial(
      new THREE.PointsMaterial({

        color:
          color,

        size:
          size,

        sizeAttenuation:
          false,

        map:
          getCircularPointTexture(),

        alphaTest:
          0.45,

        transparent:
          true,

        depthTest:
          false,

        depthWrite:
          false

      })
    );


  const points =
    new THREE.Points(
      geometry,
      material
    );


  points.frustumCulled =
    false;

  points.raycast =
    function () {};


  return points;
}


function createAnalysisCurveHelper(
  object,
  color,
  useVertexColors = false
) {

  removeAnalysisVisibilityHelper(
    object
  );


  const helperGroup =
    new THREE.Group();

  helperGroup.name =
    `${object.name || "Analysis"}_FatCurve`;

  helperGroup.userData.viewerDisplayHelper =
    true;

  helperGroup.userData.viewerAnalysisVisibilityHelper =
    true;


  const outline =
    createFatLineObject(
      object,
      0xf2f2f2,
      5.2,
      false
    );


  const inner =
    createFatLineObject(
      object,
      color,
      2.7,
      useVertexColors
    );


  if (outline) {

    outline.renderOrder =
      90;

    helperGroup.add(
      outline
    );
  }


  if (inner) {

    inner.renderOrder =
      100;

    helperGroup.add(
      inner
    );
  }


  /*
  A single-point object cannot form a line.
  Draw it as a small circular marker instead
  of the default square WebGL point.
  */

  if (
    !outline &&
    !inner
  ) {

    const pointOutline =
      createCircularPointHelper(
        object,
        0xf2f2f2,
        7
      );

    const pointInner =
      createCircularPointHelper(
        object,
        color,
        3.5
      );


    if (pointOutline) {
      helperGroup.add(
        pointOutline
      );
    }

    if (pointInner) {
      helperGroup.add(
        pointInner
      );
    }
  }


  object.add(
    helperGroup
  );


  setObjectMaterialVisible(
    object,
    false
  );
}


function createDecayMaterialForObject(
  object,
  colorValue
) {

  const color =
    new THREE.Color(
      colorValue
    );


  return markGeneratedAnalysisMaterial(
    new THREE.MeshBasicMaterial({

      color:
        color,

      side:
        THREE.DoubleSide,

      transparent:
        false,

      depthTest:
        true,

      depthWrite:
        false,

      polygonOffset:
        true,

      polygonOffsetFactor:
        -2,

      polygonOffsetUnits:
        -2

    })
  );
}


function createAnalysisMaterialCollection(
  object,
  materialFactory
) {

  const originalMaterial =
    object.userData.viewerOriginalMaterial;


  const slotCount =
    Array.isArray(originalMaterial)
      ? Math.max(
          originalMaterial.length,
          1
        )
      : 1;


  const materials = [];


  for (
    let index = 0;
    index < slotCount;
    index++
  ) {

    materials.push(
      materialFactory()
    );
  }


  return Array.isArray(
    originalMaterial
  )
    ? materials
    : materials[0];
}


function applyDecayColorToObject(
  object,
  layerKey
) {

  if (
    !isAnalysisDrawableObject(
      object
    ) ||
    object.userData.viewerDisplayHelper
  ) {
    return;
  }


  const colorValue =
    decayLayerColors[layerKey] ||
    "#000000";


  if (
    object.isLine ||
    object.isLineSegments ||
    object.isPoints
  ) {

    createAnalysisCurveHelper(
      object,
      new THREE.Color(
        colorValue
      ),
      false
    );

    return;
  }


  removeAnalysisVisibilityHelper(
    object
  );

  setObjectMaterialVisible(
    object,
    true
  );


  disposeGeneratedMaterial(
    object.material
  );


  object.material =
    createAnalysisMaterialCollection(
      object,
      function () {

        return createDecayMaterialForObject(
          object,
          colorValue
        );

      }
    );


  object.frustumCulled =
    false;
}


function setDecayLayerColor(
  layerKey,
  colorValue
) {

  if (!isDecayLayer(layerKey)) {
    return;
  }


  decayLayerColors[layerKey] =
    colorValue;


  const layer =
    loadedLayers[layerKey];


  if (!layer) {
    return;
  }


  if (layer.userData.viewerJsonDecayLayer) {
    updateJsonDecayLayerColor(
      layer,
      colorValue
    );

    return;
  }


  layer.traverse(
    function (object) {

      if (
        isAnalysisDrawableObject(
          object
        ) &&
        !object.userData.viewerDisplayHelper
      ) {

        applyDecayColorToObject(
          object,
          layerKey
        );
      }

    }
  );
}


// ==================================
// POINT-CLOUD DISPLAY MODES
// ==================================

function getFirstMaterial(
  material
) {

  return Array.isArray(
    material
  )
    ? material[0]
    : material;
}


function rememberPointGeometryColor(
  geometry
) {

  if (
    !geometry ||
    geometry.userData.viewerColorStateSaved
  ) {
    return;
  }


  geometry.userData.viewerColorStateSaved =
    true;

  geometry.userData.viewerOriginalColorAttribute =
    geometry.getAttribute(
      "color"
    ) || null;
}


function findIntensityAttribute(
  geometry
) {

  if (!geometry) {
    return null;
  }


  const attributeNames =
    Object.keys(
      geometry.attributes
    );


  const exactNames = [
    "intensity",
    "_intensity",
    "reflectance",
    "scalar"
  ];


  for (
    const preferredName
    of exactNames
  ) {

    const match =
      attributeNames.find(
        function (attributeName) {

          return attributeName.toLowerCase() ===
            preferredName;

        }
      );


    if (match) {

      return geometry.getAttribute(
        match
      );
    }
  }


  const partialMatch =
    attributeNames.find(
      function (attributeName) {

        const normalizedName =
          attributeName.toLowerCase();


        return (
          normalizedName.includes(
            "intensity"
          ) ||
          normalizedName.includes(
            "reflectance"
          )
        );

      }
    );


  return partialMatch
    ? geometry.getAttribute(
        partialMatch
      )
    : null;
}


function createIntensityColorAttribute(
  geometry
) {

  if (
    geometry.userData.viewerIntensityColorAttribute
  ) {

    return geometry.userData
      .viewerIntensityColorAttribute;
  }


  const positionAttribute =
    geometry.getAttribute(
      "position"
    );


  if (!positionAttribute) {
    return null;
  }


  const pointCount =
    positionAttribute.count;

  const colors =
    new Uint8Array(
      pointCount * 3
    );

  const intensityAttribute =
    findIntensityAttribute(
      geometry
    );

  const originalColorAttribute =
    geometry.userData
      .viewerOriginalColorAttribute;


  if (intensityAttribute) {

    let minimum =
      Number.POSITIVE_INFINITY;

    let maximum =
      Number.NEGATIVE_INFINITY;


    for (
      let index = 0;
      index < intensityAttribute.count;
      index++
    ) {

      const value =
        intensityAttribute.getX(
          index
        );


      if (!Number.isFinite(value)) {
        continue;
      }


      minimum =
        Math.min(
          minimum,
          value
        );

      maximum =
        Math.max(
          maximum,
          value
        );
    }


    const valueRange =
      Math.max(
        maximum - minimum,
        1e-12
      );


    for (
      let index = 0;
      index < pointCount;
      index++
    ) {

      const rawValue =
        intensityAttribute.getX(
          Math.min(
            index,
            intensityAttribute.count - 1
          )
        );

      const normalizedValue =
        THREE.MathUtils.clamp(
          (
            rawValue - minimum
          ) /
          valueRange,
          0,
          1
        );

      const grayscale =
        Math.pow(
          normalizedValue,
          0.72
        );

      const offset =
        index * 3;

      const grayscaleByte =
        Math.round(grayscale * 255);

      colors[offset] =
        grayscaleByte;

      colors[offset + 1] =
        grayscaleByte;

      colors[offset + 2] =
        grayscaleByte;
    }

  } else if (originalColorAttribute) {

    for (
      let index = 0;
      index < pointCount;
      index++
    ) {

      const red =
        originalColorAttribute.getX(
          index
        );

      const green =
        originalColorAttribute.itemSize > 1
          ? originalColorAttribute.getY(
              index
            )
          : red;

      const blue =
        originalColorAttribute.itemSize > 2
          ? originalColorAttribute.getZ(
              index
            )
          : red;

      const grayscale =
        THREE.MathUtils.clamp(
          red * 0.2126 +
          green * 0.7152 +
          blue * 0.0722,
          0,
          1
        );

      const offset =
        index * 3;

      colors[offset] =
        grayscale;

      colors[offset + 1] =
        grayscale;

      colors[offset + 2] =
        grayscale;
    }

  } else {

    colors.fill(
      Math.round(0.72 * 255)
    );
  }


  const colorAttribute =
    new THREE.Uint8BufferAttribute(
      colors,
      3,
      true
    );


  geometry.userData.viewerIntensityColorAttribute =
    colorAttribute;


  return colorAttribute;
}


function restoreOriginalPointColor(
  geometry
) {

  const originalColorAttribute =
    geometry.userData
      .viewerOriginalColorAttribute;


  if (originalColorAttribute) {

    geometry.setAttribute(
      "color",
      originalColorAttribute
    );

  } else if (
    geometry.getAttribute(
      "color"
    )
  ) {

    geometry.deleteAttribute(
      "color"
    );
  }
}


function createOriginalPointMaterial(
  pointObject
) {

  const material =
    cloneMaterialCollection(
      pointObject.userData
        .viewerOriginalPointMaterial
    );

  const materials =
    Array.isArray(material)
      ? material
      : [material];


  materials.forEach(
    function (item) {

      if (!item) {
        return;
      }


      item.userData.viewerGenerated =
        true;

      applyClippingToMaterial(
        item
      );

    }
  );


  return material;
}


function createIntensityPointMaterial(
  pointObject
) {

  const originalMaterial =
    getFirstMaterial(
      pointObject.userData
        .viewerOriginalPointMaterial
    );


  const material =
    new THREE.PointsMaterial({

      // Intensity colors are already written as grayscale per vertex.
      // Keep the material white so vertex colors are not multiplied by
      // the burgundy measurement color.
      color:
        0xffffff,

      size:
        Number.isFinite(
          originalMaterial &&
          originalMaterial.size
        )
          ? originalMaterial.size
          : 1,

      sizeAttenuation:
        originalMaterial &&
        "sizeAttenuation" in
          originalMaterial
          ? originalMaterial
              .sizeAttenuation
          : true,

      vertexColors:
        true,

      transparent:
        Boolean(
          originalMaterial &&
          originalMaterial.transparent
        ),

      opacity:
        originalMaterial &&
        Number.isFinite(
          originalMaterial.opacity
        )
          ? originalMaterial.opacity
          : 1,

      depthWrite:
        originalMaterial
          ? originalMaterial.depthWrite
          : true,

      toneMapped: false

    });


  if (
    originalMaterial &&
    originalMaterial.map
  ) {

    material.map =
      originalMaterial.map;

    material.alphaTest =
      originalMaterial.alphaTest ||
      0;
  }


  material.userData.viewerGenerated =
    true;

  applyClippingToMaterial(
    material
  );


  return material;
}


function applyPointDisplayModeToObject(
  pointObject,
  mode
) {

  if (
    !pointObject.isPoints ||
    !pointObject.geometry
  ) {
    return;
  }


  rememberPointGeometryColor(
    pointObject.geometry
  );


  disposeGeneratedMaterial(
    pointObject.material
  );


  if (mode === "intensity") {

    // The adaptive proxy exists only during interaction. Avoid creating a
    // second multi-million-value grayscale color buffer for it; a neutral
    // gray proxy is enough while orbiting, and full grayscale returns when
    // the camera stops.
    if (pointObject.userData.viewerAdaptiveProxy) {

      restoreOriginalPointColor(
        pointObject.geometry
      );

      const originalMaterial =
        getFirstMaterial(
          pointObject.userData.viewerOriginalPointMaterial
        );

      pointObject.material =
        new THREE.PointsMaterial({
          color: 0xb8b8b8,
          vertexColors: false,
          size: Number.isFinite(originalMaterial?.size)
            ? originalMaterial.size
            : 1.4,
          sizeAttenuation: originalMaterial?.sizeAttenuation ?? false,
          transparent: false,
          opacity: 1,
          depthTest: true,
          depthWrite: true,
          toneMapped: false
        });

      pointObject.material.userData.viewerGenerated = true;
      applyClippingToMaterial(pointObject.material);

    } else {

      const intensityColorAttribute =
        createIntensityColorAttribute(
          pointObject.geometry
        );


      if (intensityColorAttribute) {

        pointObject.geometry.setAttribute(
          "color",
          intensityColorAttribute
        );
      }


      pointObject.material =
        createIntensityPointMaterial(
          pointObject
        );
    }

  } else {

    restoreOriginalPointColor(
      pointObject.geometry
    );

    pointObject.material =
      createOriginalPointMaterial(
        pointObject
      );
  }


  pointObject.material.needsUpdate =
    true;
}


function setPointDisplayMode(
  layerKey,
  mode
) {

  if (!isPointCloudLayer(layerKey)) {
    return;
  }


  pointDisplayModes[layerKey] =
    mode;


  const layer =
    loadedLayers[layerKey];


  if (!layer) {
    return;
  }


  layer.traverse(
    function (object) {

      applyPointDisplayModeToObject(
        object,
        mode
      );

    }
  );


  applyLayerOpacity(layerKey);
  applyPointSizeControlToLayer(layerKey);
}


// ==================================
// INTERIOR POINT-CLOUD OPTIMIZATION
// ==================================

function copyBufferAttributeSample(
  attribute,
  selectedIndices
) {

  const itemSize =
    attribute.itemSize;

  const ArrayType =
    attribute.isInterleavedBufferAttribute
      ? Float32Array
      : attribute.array.constructor;

  const targetArray =
    new ArrayType(
      selectedIndices.length *
      itemSize
    );


  selectedIndices.forEach(
    function (
      sourceIndex,
      targetIndex
    ) {

      for (
        let component = 0;
        component < itemSize;
        component++
      ) {

        let value = 0;


        if (
          !attribute.isInterleavedBufferAttribute
        ) {

          value =
            attribute.array[
              sourceIndex * itemSize +
              component
            ];

        } else if (component === 0) {

          value =
            attribute.getX(
              sourceIndex
            );

        } else if (component === 1) {

          value =
            attribute.getY(
              sourceIndex
            );

        } else if (component === 2) {

          value =
            attribute.getZ(
              sourceIndex
            );

        } else if (component === 3) {

          value =
            attribute.getW(
              sourceIndex
            );
        }


        targetArray[
          targetIndex * itemSize +
          component
        ] = value;
      }

    }
  );


  return new THREE.BufferAttribute(
    targetArray,
    itemSize,
    attribute.isInterleavedBufferAttribute
      ? false
      : attribute.normalized
  );
}


function optimizeInteriorPointObject(
  pointObject
) {

  if (
    !pointObject.isPoints ||
    !pointObject.geometry ||
    pointObject.userData.viewerOptimized
  ) {
    return;
  }


  const sourceGeometry =
    pointObject.geometry;

  const positionAttribute =
    sourceGeometry.getAttribute(
      "position"
    );


  if (
    !positionAttribute ||
    positionAttribute.count < 2000
  ) {
    return;
  }


  const sourceCount =
    positionAttribute.count;

  const targetCount =
    Math.max(
      1000,
      Math.floor(
        sourceCount *
        INTERIOR_POINT_KEEP_RATIO
      )
    );


  if (targetCount >= sourceCount) {
    return;
  }


  const selectedIndices =
    new Uint32Array(
      targetCount
    );

  const selectionStep =
    sourceCount /
    targetCount;


  for (
    let index = 0;
    index < targetCount;
    index++
  ) {

    selectedIndices[index] =
      Math.min(
        sourceCount - 1,
        Math.floor(
          index *
          selectionStep
        )
      );
  }


  const optimizedGeometry =
    new THREE.BufferGeometry();


  Object.entries(
    sourceGeometry.attributes
  ).forEach(
    function ([name, attribute]) {

      optimizedGeometry.setAttribute(
        name,
        copyBufferAttributeSample(
          attribute,
          selectedIndices
        )
      );

    }
  );


  optimizedGeometry.name =
    `${sourceGeometry.name || "PointCloud"}_WebOptimized`;

  optimizedGeometry.computeBoundingBox();
  optimizedGeometry.computeBoundingSphere();

  rememberPointGeometryColor(
    optimizedGeometry
  );


  pointObject.geometry =
    optimizedGeometry;

  pointObject.userData.viewerOptimized =
    true;

  pointObject.userData.viewerOriginalPointCount =
    sourceCount;

  pointObject.userData.viewerOptimizedPointCount =
    targetCount;


  sourceGeometry.dispose();


  console.log(
    `Interior point cloud optimized: ${sourceCount.toLocaleString()} → ${targetCount.toLocaleString()} points`
  );
}


// ==================================
// PREPARE LOADED OBJECT
// ==================================

function prepareLoadedObject(
  model,
  layerKey
) {

  let meshIndex = 0;


  model.traverse(
    function (object) {

      if (
        object.userData.viewerDisplayHelper
      ) {
        return;
      }


      if (
        isAnalysisDrawableObject(
          object
        ) &&
        isAnalysisMeshLayer(
          layerKey
        )
      ) {

        object.frustumCulled =
          false;


        object.userData.viewerOriginalMaterial =
          cloneMaterialCollection(
            object.material
          );


        applyDecayColorToObject(
          object,
          layerKey
        );
      }


      if (
        object.isMesh &&
        isModelLayer(layerKey)
      ) {

        object.frustumCulled =
          false;

        object.userData.viewerMeshIndex =
          meshIndex;

        meshIndex++;


        object.userData.viewerOriginalMaterial =
          cloneMaterialCollection(
            object.material
          );


        applyDisplayModeToMesh(
          object,
          layerKey,
          modelDisplayModes[layerKey]
        );
      }


      if (
        object.isPoints &&
        isPointCloudLayer(
          layerKey
        )
      ) {

        // Geometry has a valid bounding sphere, so let Three.js skip the
        // entire cloud when it is outside the camera frustum.
        object.frustumCulled =
          true;

        object.userData.viewerOriginalPointMaterial =
          cloneMaterialCollection(
            object.material
          );


        rememberPointGeometryColor(
          object.geometry
        );


        // Draco already gives us the compressed full-density cloud.
        // Do not throw away another 50% of its points in the browser.
        // Keep the old GLB optimization only as a legacy fallback.
        if (
          layerKey === "intPC" &&
          object.userData.viewerSourceFormat !== "drc"
        ) {

          optimizeInteriorPointObject(
            object
          );
        }


        applyPointDisplayModeToObject(
          object,
          pointDisplayModes[layerKey]
        );

        applyManualPointSizeToPointObject(
          object,
          layerKey
        );
      }


      if (
        isPointCloudLayer(
          layerKey
        ) &&
        object.isPoints
      ) {

        object.frustumCulled =
          true;
      }


      forEachObjectMaterial(
        object,
        function (material) {

          applyClippingToMaterial(
            material
          );

        }
      );

    }
  );
}


// ==================================
// JSON ANALYSIS LAYERS
// ==================================

function getFileExtension(
  filePath
) {

  if (!filePath) {
    return "";
  }


  const normalizedPath =
    filePath.split("?")[0].toLowerCase();


  const parts =
    normalizedPath.split(".");


  return parts.length > 1
    ? parts[parts.length - 1]
    : "";
}


function createJsonSegmentPositions(
  curves
) {

  const segmentPositions = [];


  (curves || []).forEach(
    function (curve) {

      const points =
        Array.isArray(curve.points)
          ? curve.points
          : [];


      if (points.length < 2) {
        return;
      }


      for (
        let index = 0;
        index < points.length - 1;
        index++
      ) {

        const start = points[index];
        const end = points[index + 1];


        if (
          !Array.isArray(start) ||
          !Array.isArray(end) ||
          start.length < 3 ||
          end.length < 3
        ) {
          continue;
        }


        /*
        Rhino uses Z-up coordinates, while glTF/Three.js
        displays the exported model in Y-up coordinates.
        Apply the same -90° X-axis conversion used by glTF:
        Rhino (X, Y, Z) -> Three.js (X, Z, -Y)
        */
        segmentPositions.push(
          start[0], start[2], -start[1],
          end[0], end[2], -end[1]
        );
      }


      if (curve.closed && points.length > 2) {

        const first = points[0];
        const last = points[points.length - 1];


        if (
          Array.isArray(first) &&
          Array.isArray(last) &&
          first.length >= 3 &&
          last.length >= 3
        ) {

          const isAlreadyClosed =
            first[0] === last[0] &&
            first[1] === last[1] &&
            first[2] === last[2];


          if (!isAlreadyClosed) {
            segmentPositions.push(
              last[0], last[2], -last[1],
              first[0], first[2], -first[1]
            );
          }
        }
      }

    }
  );


  return segmentPositions;
}


function createJsonDecayLayerGroup(
  layerKey,
  jsonData
) {

  const segmentPositions =
    createJsonSegmentPositions(
      jsonData.curves
    );


  if (segmentPositions.length < 6) {
    throw new Error(
      `${layerKey} JSON contains no usable curve segments.`
    );
  }


  const geometry =
    new LineSegmentsGeometry();

  geometry.setPositions(
    segmentPositions
  );


  const innerMaterial =
    createFatLineMaterial({
      color: new THREE.Color(
        decayLayerColors[layerKey] || "#000000"
      ),
      linewidth:
        decayLineThickness,
      vertexColors: false,
      depthTest: false
    });


  applyClippingToMaterial(
    innerMaterial
  );


  const inner =
    new LineSegments2(
      geometry,
      innerMaterial
    );


  inner.computeLineDistances();

  inner.frustumCulled = false;

  inner.renderOrder = 100;

  inner.raycast = function () {};


  const group =
    new THREE.Group();

  group.name =
    layerKey;

  group.userData.viewerJsonDecayLayer = true;
  group.userData.viewerInnerMaterial = innerMaterial;
  group.userData.viewerOutlineMaterial = null;
  group.userData.viewerCurveCount = jsonData.curveCount || 0;
  group.userData.viewerPointCount = jsonData.pointCount || 0;

  group.add(inner);

  applyClippingToObject(group);


  return group;
}


function updateJsonDecayLayerColor(
  layer,
  colorValue
) {

  if (
    !layer ||
    !layer.userData.viewerJsonDecayLayer
  ) {
    return;
  }


  const innerMaterial =
    layer.userData.viewerInnerMaterial;


  if (innerMaterial) {
    innerMaterial.color.set(
      colorValue
    );

    innerMaterial.needsUpdate =
      true;
  }
}


function updateAllDecayLineThickness(
  thicknessValue
) {

  if (
    !Number.isFinite(
      thicknessValue
    )
  ) {
    return;
  }


  decayLineThickness =
    thicknessValue;


  if (decayLineThicknessValue) {
    decayLineThicknessValue.textContent =
      `${thicknessValue.toFixed(1)} px`;
  }


  decayLayerKeys.forEach(
    function (layerKey) {

      const layer =
        loadedLayers[layerKey];


      if (
        !layer ||
        !layer.userData.viewerJsonDecayLayer
      ) {
        return;
      }


      const innerMaterial =
        layer.userData.viewerInnerMaterial;

      if (innerMaterial) {
        innerMaterial.linewidth =
          thicknessValue;

        innerMaterial.needsUpdate =
          true;
      }



    }
  );
}


function loadJsonCurveLayer(
  layerKey,
  filePath
) {

  return fetch(
    encodeURI(filePath),
    { cache: "no-store" }
  )
    .then(function (response) {

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} while loading ${filePath}`
        );
      }


      return response.json();
    })
    .then(function (jsonData) {

      const layerGroup =
        createJsonDecayLayerGroup(
          layerKey,
          jsonData
        );


      console.info(
        `JSON analysis layer ${layerKey}: ${jsonData.curveCount || 0} curves, ${jsonData.pointCount || 0} sampled points`
      );


      return layerGroup;
    });
}


// ==================================
// STANDALONE DRACO POINT CLOUDS
// ==================================

// Three.js assumes standalone .drc vertex colours are already suitable for
// its working colour space. DracoPy, however, stores the CloudCompare/Rhino
// RGB values as 8-bit 0..255 values. Decode without Three.js' automatic
// sRGB conversion, then convert those raw values once here.
function loadStandaloneDracoGeometry(
  filePath,
  onLoad,
  onProgress,
  onError
) {

  const fileLoader =
    new THREE.FileLoader();

  fileLoader.setResponseType(
    "arraybuffer"
  );

  fileLoader.load(
    encodeURI(filePath),

    function (buffer) {
      dracoLoader.decodeDracoFile(
        buffer,
        onLoad,
        null,
        null,
        THREE.LinearSRGBColorSpace,
        onError
      );
    },

    onProgress,
    onError
  );
}


function fixDracoPointColors(
  geometry
) {

  const colorAttribute =
    geometry.getAttribute("color");

  if (!colorAttribute) {
    return null;
  }

  const colorArray =
    colorAttribute.array;

  if (!colorArray || colorArray.length === 0) {
    return colorAttribute;
  }

  // DracoPy RGB is stored as 8-bit survey colour. Decode it once, convert
  // sRGB -> linear, and keep it as normalized Uint8 instead of Float32.
  // This cuts colour-buffer memory by about 75% for very large clouds.
  let sampledMaximum = 0;
  const sampleStride = Math.max(1, Math.floor(colorArray.length / 8192));

  for (let index = 0; index < colorArray.length; index += sampleStride) {
    sampledMaximum = Math.max(sampledMaximum, Number(colorArray[index]) || 0);
  }

  const sourceIsByteRange = sampledMaximum > 1.0001;
  const srgbByteToLinearByte = new Uint8Array(256);

  for (let value = 0; value < 256; value++) {
    const srgb = value / 255;
    const linear = srgb <= 0.04045
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
    srgbByteToLinearByte[value] = Math.round(linear * 255);
  }

  const compactColors = new Uint8Array(colorArray.length);

  for (let index = 0; index < colorArray.length; index++) {
    const raw = Number(colorArray[index]) || 0;
    const sourceByte = sourceIsByteRange
      ? Math.round(raw)
      : Math.round(THREE.MathUtils.clamp(raw, 0, 1) * 255);
    compactColors[index] = srgbByteToLinearByte[
      Math.max(0, Math.min(255, sourceByte))
    ];
  }

  const compactAttribute = new THREE.Uint8BufferAttribute(
    compactColors,
    colorAttribute.itemSize || 3,
    true
  );

  compactAttribute.name = colorAttribute.name || "color";
  geometry.setAttribute("color", compactAttribute);

  return compactAttribute;
}

function getAdaptivePointBudget(
  layerKey,
  sourceCount
) {

  const configuredBudget =
    ADAPTIVE_POINT_BUDGETS[layerKey] || 1200000;

  return Math.max(
    100000,
    Math.min(
      sourceCount,
      configuredBudget
    )
  );
}


function createAdaptivePointProxy(
  fullPoints,
  layerKey
) {

  const sourceGeometry = fullPoints.geometry;
  const positionAttribute = sourceGeometry.getAttribute("position");

  if (!positionAttribute) {
    return null;
  }

  const sourceCount = positionAttribute.count;
  const targetCount = getAdaptivePointBudget(layerKey, sourceCount);

  // Small clouds are already cheap enough; avoid creating a proxy at all.
  if (sourceCount <= targetCount * 1.15) {
    return null;
  }

  // The proxy shares the full position/color attributes with the original
  // cloud. Only a compact index buffer is added, so we do not duplicate the
  // hundreds of MB of point data in RAM/GPU memory.
  const proxyGeometry = new THREE.BufferGeometry();

  Object.entries(sourceGeometry.attributes).forEach(
    function ([name, attribute]) {
      proxyGeometry.setAttribute(name, attribute);
    }
  );

  const selectedIndices = new Uint32Array(targetCount);
  const step = sourceCount / targetCount;

  for (let index = 0; index < targetCount; index++) {
    selectedIndices[index] = Math.min(
      sourceCount - 1,
      Math.floor(index * step)
    );
  }

  proxyGeometry.setIndex(
    new THREE.BufferAttribute(selectedIndices, 1)
  );

  proxyGeometry.boundingBox = sourceGeometry.boundingBox
    ? sourceGeometry.boundingBox.clone()
    : null;

  proxyGeometry.boundingSphere = sourceGeometry.boundingSphere
    ? sourceGeometry.boundingSphere.clone()
    : null;

  proxyGeometry.name = `${sourceGeometry.name || layerKey}_AdaptiveProxy`;

  const proxyMaterial = fullPoints.material.clone();

  // The proxy contains fewer samples, so its dots are intentionally larger.
  // Scale approximately with the square-root of the density reduction: this
  // preserves visual surface coverage without adding geometry.
  const densityCompensation = Math.sqrt(sourceCount / targetCount);
  proxyMaterial.size = THREE.MathUtils.clamp(
    (Number(fullPoints.material.size) || POINT_SIZE_SETTINGS.base) *
      Math.min(densityCompensation, 1.85) *
      POINT_PROXY_SIZE_MULTIPLIER,
    POINT_SIZE_SETTINGS.min * 1.15,
    POINT_SIZE_SETTINGS.max * 1.45
  );

  const proxyPoints = new THREE.Points(
    proxyGeometry,
    proxyMaterial
  );

  proxyPoints.name = `${layerKey}-AdaptiveProxy`;
  proxyPoints.visible = false;
  proxyPoints.frustumCulled = true;
  proxyPoints.userData.viewerAdaptiveProxy = true;
  proxyPoints.userData.viewerSourceFormat = "drc";
  proxyPoints.userData.viewerAdaptiveSourceCount = sourceCount;
  proxyPoints.userData.viewerAdaptivePointCount = targetCount;

  // Never make the interaction proxy participate in measurement/picking.
  // The full survey object remains the authoritative geometry.
  proxyPoints.raycast = function () {};

  return proxyPoints;
}


function getPointCloudScreenSize(
  model,
  pointObject,
  isProxy = false
) {

  const layerKey = model && model.name;
  const userBaseSize = getPointSizePixels(layerKey);
  const geometry = pointObject && pointObject.geometry;
  const sphere = geometry && geometry.boundingSphere;

  if (!sphere || !Number.isFinite(sphere.radius) || sphere.radius <= 0) {
    return isProxy
      ? userBaseSize * POINT_PROXY_SIZE_MULTIPLIER
      : userBaseSize;
  }

  model.updateMatrixWorld(true);

  const center = sphere.center.clone().applyMatrix4(pointObject.matrixWorld);
  const worldScale = pointObject.getWorldScale(new THREE.Vector3());
  const radius = sphere.radius * Math.max(
    Math.abs(worldScale.x),
    Math.abs(worldScale.y),
    Math.abs(worldScale.z),
    0.000001
  );

  const distance = Math.max(
    camera.position.distanceTo(center),
    radius * 0.35
  );

  const referenceDistance =
    radius * POINT_SIZE_SETTINGS.referenceDistanceInRadii;

  // Projected sample spacing grows as the camera gets closer. Compensating
  // inversely with distance keeps the cloud visually continuous across zoom.
  // Keep only a mild automatic zoom compensation. The slider remains the
  // dominant control, so changing it produces an obvious visual result.
  const zoomScale = THREE.MathUtils.clamp(
    referenceDistance / distance,
    0.90,
    1.60
  );

  let size =
    userBaseSize *
    zoomScale;

  if (isProxy) {
    const sourceCount =
      pointObject.userData.viewerAdaptiveSourceCount || 1;
    const proxyCount =
      pointObject.userData.viewerAdaptivePointCount || sourceCount;
    const densityCompensation = Math.sqrt(
      Math.max(sourceCount / Math.max(proxyCount, 1), 1)
    );

    size *= Math.min(densityCompensation, 1.85) *
      POINT_PROXY_SIZE_MULTIPLIER;
  }

  return THREE.MathUtils.clamp(
    size,
    isProxy ? userBaseSize * 1.05 : userBaseSize * 0.90,
    isProxy ? userBaseSize * 2.10 : userBaseSize * 1.60
  );
}


function updateAdaptivePointCloudSizes() {

  Object.values(loadedLayers).forEach(function (model) {
    if (!model || model.userData.viewerSourceFormat !== "drc") return;

    const fullPoints = model.userData.viewerAdaptiveFullPoints;
    const proxyPoints = model.userData.viewerAdaptiveProxyPoints;

    if (fullPoints && fullPoints.material && !Array.isArray(fullPoints.material)) {
      const nextSize = getPointCloudScreenSize(model, fullPoints, false);
      if (Math.abs((Number(fullPoints.material.size) || 0) - nextSize) > 0.02) {
        fullPoints.material.size = nextSize;
        fullPoints.material.needsUpdate = true;
      }
    }

    if (proxyPoints && proxyPoints.material && !Array.isArray(proxyPoints.material)) {
      const nextSize = getPointCloudScreenSize(model, proxyPoints, true);
      if (Math.abs((Number(proxyPoints.material.size) || 0) - nextSize) > 0.02) {
        proxyPoints.material.size = nextSize;
        proxyPoints.material.needsUpdate = true;
      }
    }
  });
}


function applyAdaptivePointCloudQualityToModel(
  model,
  interactionActive
) {

  if (!model) return;

  const fullPoints = model.userData.viewerAdaptiveFullPoints;
  const proxyPoints = model.userData.viewerAdaptiveProxyPoints;

  if (!fullPoints) return;

  if (!proxyPoints) {
    fullPoints.visible = true;
    return;
  }

  fullPoints.visible = !interactionActive;
  proxyPoints.visible = interactionActive;
}


function applyAdaptivePointCloudQuality() {

  Object.values(loadedLayers).forEach(
    function (model) {
      applyAdaptivePointCloudQualityToModel(
        model,
        adaptivePointCloudInteractionActive
      );
    }
  );

  updateAdaptivePointCloudSizes();
}


function setAdaptivePointCloudInteraction(
  active
) {

  if (adaptivePointCloudInteractionActive === active) {
    return;
  }

  adaptivePointCloudInteractionActive = active;
  applyAdaptivePointCloudQuality();
}


function scheduleFullPointCloudQuality() {

  clearTimeout(adaptivePointCloudRestoreTimer);

  adaptivePointCloudRestoreTimer = setTimeout(
    function () {
      setAdaptivePointCloudInteraction(false);
    },
    ADAPTIVE_FULL_QUALITY_DELAY_MS
  );
}


controls.addEventListener("start", function () {
  clearTimeout(adaptivePointCloudRestoreTimer);
  setAdaptivePointCloudInteraction(true);
});

controls.addEventListener("change", function () {
  setAdaptivePointCloudInteraction(true);
  scheduleFullPointCloudQuality();
});

controls.addEventListener("end", function () {
  scheduleFullPointCloudQuality();
});


function createDracoPointCloudModel(
  geometry,
  layerKey,
  filePath
) {

  if (!isPointCloudLayer(layerKey)) {
    throw new Error(
      `${filePath} is a Draco geometry, but ${layerKey} is not configured as a point-cloud layer.`
    );
  }


  const positionAttribute =
    geometry.getAttribute("position");


  if (
    !positionAttribute ||
    positionAttribute.count === 0
  ) {
    throw new Error(
      `${filePath} contains no point positions.`
    );
  }


  const colorAttribute =
    fixDracoPointColors(
      geometry
    );


  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();


  const pointMaterial =
    new THREE.PointsMaterial({
      color: 0xffffff,
      vertexColors: Boolean(colorAttribute),

      // Screen-space size is updated from camera distance below. This keeps
      // point coverage visually stable across zoom without deleting samples.
      size: getPointSizePixels(layerKey),
      sizeAttenuation: false,

      transparent: false,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      toneMapped: false
    });


  const points =
    new THREE.Points(
      geometry,
      pointMaterial
    );

  points.name =
    `${layerKey}-DracoPoints`;

  points.frustumCulled = true;
  points.userData.viewerSourceFormat =
    "drc";
  points.userData.viewerSourcePath =
    filePath;


  const model =
    new THREE.Group();

  model.name = layerKey;
  model.userData.viewerSourceFormat =
    "drc";
  model.userData.viewerSourcePath =
    filePath;

  // CloudCompare / PLY survey coordinates are Z-up. Rhino's GLB export
  // converts them to glTF's Y-up convention automatically; standalone DRC
  // does not. Apply the same Z-up -> Y-up conversion here so DRC overlays
  // the existing Rhino models and legacy GLBs exactly.
  model.rotation.x = -Math.PI / 2;

  const adaptiveProxy =
    createAdaptivePointProxy(
      points,
      layerKey
    );

  points.userData.viewerAdaptiveFull =
    Boolean(adaptiveProxy);

  model.userData.viewerAdaptiveFullPoints =
    points;

  model.userData.viewerAdaptiveProxyPoints =
    adaptiveProxy;

  model.add(points);

  if (adaptiveProxy) {
    model.add(adaptiveProxy);
  }

  applyAdaptivePointCloudQualityToModel(
    model,
    adaptivePointCloudInteractionActive
  );

  // Initial size before the layer is registered in loadedLayers.
  points.material.size = getPointCloudScreenSize(model, points, false);
  if (adaptiveProxy) {
    adaptiveProxy.material.size = getPointCloudScreenSize(model, adaptiveProxy, true);
  }


  console.info(
    `Draco point cloud ${layerKey}: ${positionAttribute.count.toLocaleString()} points${colorAttribute ? " with RGB" : ""}${adaptiveProxy ? `; moving proxy ${adaptiveProxy.userData.viewerAdaptivePointCount.toLocaleString()} points` : ""}`
  );


  return model;
}


// ==================================
// LOAD ONE LAYER
// ==================================

function getLayerFileCandidates(
  layerKey
) {

  const configuredFiles =
    layerFiles[layerKey];


  if (!configuredFiles) {
    return [];
  }


  return Array.isArray(
    configuredFiles
  )
    ? configuredFiles
    : [configuredFiles];
}


function loadLayer(
  layerKey
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      if (
        loadedLayers[
          layerKey
        ]
      ) {

        loadedLayers[
          layerKey
        ].visible = true;

        applyLayerOpacity(layerKey);
        applyClippingToObject(
          loadedLayers[
            layerKey
          ]
        );

        updateGroundPlane();
        updateAutomaticModelPointCloudOpacity();

        resolve(
          loadedLayers[
            layerKey
          ]
        );

        return;
      }


      const fileCandidates =
        getLayerFileCandidates(
          layerKey
        );


      if (
        fileCandidates.length === 0
      ) {

        reject(
          new Error(
            `No GLB file defined for ${layerKey}`
          )
        );

        return;
      }


      let candidateIndex =
        0;


      function tryNextFile(
        previousError = null
      ) {

        if (
          candidateIndex >=
          fileCandidates.length
        ) {

          const attemptedFiles =
            fileCandidates.join(
              ", "
            );


          console.error(
            `Could not load ${layerKey}. Tried: ${attemptedFiles}`,
            previousError
          );


          showLoading(
            `Error loading ${fileCandidates[0]}`
          );


          reject(
            previousError ||
            new Error(
              `Could not load ${layerKey}`
            )
          );

          return;
        }


        const filePath =
          fileCandidates[
            candidateIndex
          ];

        candidateIndex +=
          1;


        showLoading(
          `Loading ${filePath} ...`
        );


        const fileExtension =
          getFileExtension(
            filePath
          );


        if (fileExtension === "json") {

          loadJsonCurveLayer(
            layerKey,
            filePath
          )
            .then(function (model) {

              model.name =
                layerKey;

              loadedLayers[
                layerKey
              ] = model;

              rootGroup.add(
                model
              );

              model.visible = true;
              applyLayerOpacity(layerKey);

              updateGroundPlane();
              updateAutomaticModelPointCloudOpacity();

              console.log(
                `${filePath} loaded successfully`
              );

              showLoading(
                `${filePath} loaded`
              );

              hideLoading();

              resolve(model);
            })
            .catch(function (error) {

              console.warn(
                `Could not load ${filePath}; trying the next filename.`,
                error
              );

              tryNextFile(error);
            });

          return;
        }


        if (fileExtension === "drc") {

          loadStandaloneDracoGeometry(

            filePath,


            function (geometry) {

              try {

                const model =
                  createDracoPointCloudModel(
                    geometry,
                    layerKey,
                    filePath
                  );


                prepareLoadedObject(
                  model,
                  layerKey
                );


                loadedLayers[
                  layerKey
                ] = model;


                rootGroup.add(
                  model
                );


                model.visible = true;

                applyLayerOpacity(
                  layerKey
                );

                updateGroundPlane();
                updateAutomaticModelPointCloudOpacity();


                console.log(
                  `${filePath} loaded successfully`
                );


                showLoading(
                  `${filePath} loaded`
                );

                hideLoading();


                resolve(model);

              } catch (error) {

                if (geometry) {
                  geometry.dispose();
                }

                console.warn(
                  `Could not prepare ${filePath}; trying the next filename.`,
                  error
                );

                tryNextFile(error);
              }
            },


            function (progress) {

              if (progress.total > 0) {

                const percent =
                  Math.round(
                    progress.loaded /
                    progress.total *
                    100
                  );

                showLoading(
                  `Loading ${filePath}: ${percent}%`
                );
              }
            },


            function (error) {

              console.warn(
                `Could not load ${filePath}; trying the next filename.`,
                error
              );

              tryNextFile(error);
            }
          );

          return;
        }


        loader.load(

          encodeURI(
            filePath
          ),


          function (gltf) {

            const model =
              gltf.scene;

            model.name =
              layerKey;


            prepareLoadedObject(
              model,
              layerKey
            );


            if (
              isAnalysisMeshLayer(
                layerKey
              )
            ) {

              let meshCount = 0;
              let lineCount = 0;
              let pointCount = 0;
              let vertexCount = 0;


              model.traverse(
                function (object) {

                  if (
                    object.userData.viewerDisplayHelper
                  ) {
                    return;
                  }


                  if (object.isMesh) {
                    meshCount++;
                  }

                  if (
                    object.isLine ||
                    object.isLineSegments
                  ) {
                    lineCount++;
                  }

                  if (object.isPoints) {
                    pointCount++;
                  }


                  const position =
                    object.geometry &&
                    object.geometry.getAttribute
                      ? object.geometry.getAttribute(
                          "position"
                        )
                      : null;


                  if (position) {
                    vertexCount +=
                      position.count;
                  }

                }
              );


              console.info(
                `Analysis layer ${layerKey}: ${meshCount} meshes, ${lineCount} curves, ${pointCount} point objects, ${vertexCount} vertices`
              );


              if (
                meshCount === 0 &&
                lineCount === 0 &&
                pointCount === 0
              ) {

                throw new Error(
                  `${filePath} contains no renderable mesh, curve, or point geometry.`
                );
              }
            }


            loadedLayers[
              layerKey
            ] = model;


            rootGroup.add(
              model
            );



            model.visible =
              true;

            applyLayerOpacity(layerKey);
            updateGroundPlane();
            updateAutomaticModelPointCloudOpacity();


            console.log(
              `${filePath} loaded successfully`
            );


            showLoading(
              `${filePath} loaded`
            );

            hideLoading();


            resolve(
              model
            );
          },


          function (progress) {

            if (
              progress.total > 0
            ) {

              const percent =
                Math.round(

                  progress.loaded /
                  progress.total *
                  100

                );


              showLoading(
                `Loading ${filePath}: ${percent}%`
              );
            }

          },


          function (error) {

            console.warn(
              `Could not load ${filePath}; trying the next filename.`,
              error
            );


            tryNextFile(
              error
            );
          }

        );
      }


      tryNextFile();

    }
  );
}


// ==================================
// FIT CAMERA TO VISIBLE LAYERS
// ==================================

function fitCameraToVisibleLayers() {

  const totalBox =
    getVisibleGeometryBounds();


  if (!totalBox) {
    return;
  }


  const size =
    totalBox.getSize(
      new THREE.Vector3()
    );


  const center =
    totalBox.getCenter(
      new THREE.Vector3()
    );


  const maxSize =
    Math.max(
      size.x,
      size.y,
      size.z
    );


  if (
    !Number.isFinite(
      maxSize
    ) ||
    maxSize <= 0
  ) {
    return;
  }


  const fovRadians =
    THREE.MathUtils
      .degToRad(
        camera.fov
      );


  let distance =
    maxSize /
    (
      2 *
      Math.tan(
        fovRadians / 2
      )
    );


  distance *= 1.58;


  const direction =
    new THREE.Vector3(
      -1.35,
      0.76,
      1.08
    ).normalize();


  camera.position.copy(

    center
      .clone()
      .add(

        direction.multiplyScalar(
          distance
        )

      )

  );


  // Tight depth range = much better depth precision. This is critical on
  // phones, where an enormous near/far ratio makes coplanar model and point
  // cloud surfaces visibly fight even when desktop looks acceptable.
  camera.near =
    Math.max(
      maxSize / 5000,
      0.01
    );


  camera.far =
    Math.max(
      maxSize * 60,
      1000
    );


  camera.updateProjectionMatrix();


  controls.target.copy(
    center
  );

  controls.update();

  updateArchitecturalLighting(
    totalBox
  );

  updateGroundPlane();
}


// ==================================
// MEASUREMENT TOOLS
// ==================================

// The GLB files are treated as metre-based models.
// Change this value only when the source files use
// another unit, for example 0.001 for millimetres.

const MODEL_UNIT_TO_METERS =
  1;


const measurementRaycaster =
  new THREE.Raycaster();

const measurementPointer =
  new THREE.Vector2();

const measurementRoot =
  new THREE.Group();

measurementRoot.name =
  "Measurements";

scene.add(
  measurementRoot
);


let measurementMode =
  null;

let measurementUnit =
  "m";

let measurementColor = "#7a1f1f";

let measurementRecords = [];
let measurementRecordSequence = 0;

function formatMeasurementMeters(valueMeters) {
  if (measurementUnit === "cm") return `${(valueMeters * 100).toFixed(2)} cm`;
  if (measurementUnit === "mm") return `${(valueMeters * 1000).toFixed(2)} mm`;
  return `${valueMeters.toFixed(2)} m`;
}

let pendingMeasurementPoints =
  [];

let pendingMeasurementGroup =
  null;

let measurementPointerDown =
  null;


function getMeasurementSceneScale() {

  const bounds =
    getVisibleGeometryBounds();


  if (!bounds) {
    return 1;
  }


  const size =
    bounds.getSize(
      new THREE.Vector3()
    );


  return Math.max(
    size.x,
    size.y,
    size.z,
    1
  );
}


function getMeasurementTargets() {

  const targets = [];


  Object.values(
    loadedLayers
  ).forEach(
    function (layer) {

      if (!layer.visible) {
        return;
      }


      layer.traverse(
        function (object) {

          if (
            object.isMesh ||
            object.isPoints
          ) {

            targets.push(
              object
            );
          }

        }
      );

    }
  );


  return targets;
}


function isPointInsideSectionBox(
  worldPoint
) {

  if (!sectionBoxEnabled) {
    return true;
  }


  const localPoint =
    sectionBox.worldToLocal(
      worldPoint.clone()
    );


  const tolerance =
    0.0005;


  return (
    Math.abs(localPoint.x) <=
      0.5 + tolerance &&

    Math.abs(localPoint.y) <=
      0.5 + tolerance &&

    Math.abs(localPoint.z) <=
      0.5 + tolerance
  );
}


function getPointPickingThreshold() {

  const canvasHeight =
    Math.max(
      renderer.domElement.clientHeight,
      1
    );

  const targetDistance =
    Math.max(
      camera.position.distanceTo(
        controls.target
      ),
      camera.near
    );

  const visibleWorldHeight =
    2 *
    targetDistance *
    Math.tan(
      THREE.MathUtils.degToRad(
        camera.fov
      ) /
      2
    );

  const worldUnitsPerPixel =
    visibleWorldHeight /
    canvasHeight;


  return Math.max(
    worldUnitsPerPixel * 2.25,
    getMeasurementSceneScale() *
      0.00002
  );
}


function getExactMeasurementIntersectionPoint(
  intersection
) {

  const targetObject =
    intersection.object;


  if (
    targetObject &&
    targetObject.isPoints &&
    Number.isInteger(
      intersection.index
    )
  ) {

    const positionAttribute =
      targetObject.geometry.getAttribute(
        "position"
      );


    if (positionAttribute) {

      const exactPoint =
        new THREE.Vector3()
          .fromBufferAttribute(
            positionAttribute,
            intersection.index
          );


      return targetObject.localToWorld(
        exactPoint
      );
    }
  }


  return intersection.point.clone();
}


function pickMeasurementPoint(
  pointerEvent
) {

  const bounds =
    renderer.domElement
      .getBoundingClientRect();


  measurementPointer.x =
    (
      (
        pointerEvent.clientX -
        bounds.left
      ) /
      bounds.width
    ) * 2 - 1;


  measurementPointer.y =
    -(
      (
        pointerEvent.clientY -
        bounds.top
      ) /
      bounds.height
    ) * 2 + 1;


  measurementRaycaster.setFromCamera(
    measurementPointer,
    camera
  );


  measurementRaycaster.params.Points.threshold =
    getPointPickingThreshold();


  const intersections =
    measurementRaycaster.intersectObjects(
      getMeasurementTargets(),
      false
    );


  for (
    const intersection
    of intersections
  ) {

    const exactPoint =
      getExactMeasurementIntersectionPoint(
        intersection
      );


    if (
      isPointInsideSectionBox(
        exactPoint
      )
    ) {

      return exactPoint;
    }
  }


  return null;
}


function createMeasurementMaterial(
  color
) {

  return new THREE.LineBasicMaterial({

    color:
      color,

    depthTest:
      false,

    depthWrite:
      false,

    transparent:
      true,

    opacity:
      0.95

  });
}


function createMeasurementMarkerTexture() {

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    64;

  canvas.height =
    64;


  const context =
    canvas.getContext(
      "2d"
    );


  context.clearRect(
    0,
    0,
    64,
    64
  );

  context.beginPath();
  context.arc(
    32,
    32,
    16,
    0,
    Math.PI * 2
  );

  context.fillStyle =
    "rgba(255, 255, 255, 0.98)";

  context.fill();

  context.lineWidth =
    6;

  context.strokeStyle =
    "rgba(15, 15, 15, 0.95)";

  context.stroke();


  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;


  return texture;
}


const measurementMarkerTexture =
  createMeasurementMarkerTexture();


function createMeasurementMarker(
  point
) {

  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        [
          new THREE.Vector3(
            0,
            0,
            0
          )
        ]
      );

  const material =
    new THREE.PointsMaterial({

      color:
        0xffffff,

      size:
        8,

      sizeAttenuation:
        false,

      map:
        measurementMarkerTexture,

      transparent:
        true,

      alphaTest:
        0.2,

      depthTest:
        false,

      depthWrite:
        false

    });

  const marker =
    new THREE.Points(
      geometry,
      material
    );


  marker.position.copy(
    point
  );

  marker.renderOrder =
    120;
  marker.userData.viewerMeasurementColor = true;


  return marker;
}


function createMeasurementLine(
  points,
  color = measurementColor
) {

  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        points
      );


  const line =
    new THREE.Line(
      geometry,
      createMeasurementMaterial(
        color
      )
    );


  line.renderOrder =
    119;
  line.userData.viewerMeasurementColor = true;


  return line;
}


function createMeasurementLabel(
  text,
  position
) {

  const element =
    document.createElement(
      "div"
    );

  element.className =
    "measurement-label";

  element.textContent =
    text;
  element.style.setProperty("--measurement-color", measurementColor);


  const label =
    new CSS2DObject(
      element
    );

  label.position.copy(
    position
  );


  return label;
}


function applyMeasurementColorToExisting() {
  const color = new THREE.Color(measurementColor);
  measurementRoot.traverse(function (object) {
    if (object.userData && object.userData.viewerMeasurementColor && object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(function (material) {
        if (material && material.color) {
          material.color.copy(color);
          material.needsUpdate = true;
        }
      });
    }
    if (object.element && object.element.classList && object.element.classList.contains("measurement-label")) {
      object.element.style.setProperty("--measurement-color", measurementColor);
    }
  });
}


function disposeMeasurementObject(
  object
) {

  object.traverse(
    function (child) {

      if (child.element) {
        child.element.remove();
      }


      if (child.geometry) {
        child.geometry.dispose();
      }


      if (child.material) {

        const materials =
          Array.isArray(
            child.material
          )
            ? child.material
            : [child.material];


        materials.forEach(
          function (material) {

            material.dispose();

          }
        );
      }

    }
  );
}


function removeMeasurementGroup(
  group
) {

  if (!group) {
    return;
  }


  measurementRoot.remove(
    group
  );

  disposeMeasurementObject(
    group
  );
}


function cancelPendingMeasurement() {

  removeMeasurementGroup(
    pendingMeasurementGroup
  );


  pendingMeasurementGroup =
    null;

  pendingMeasurementPoints =
    [];
}


function clearMeasurements() {

  cancelPendingMeasurement();

  measurementRoot.children
    .slice()
    .forEach(
      function (child) {
        removeMeasurementGroup(child);
      }
    );

  measurementRecords = [];
  refreshMeasurementHistory();
}


function measurementValueText(record) {
  if (record.type === "distance") {
    return formatMeasurementMeters(record.value);
  }
  if (record.type === "angle") {
    return `${record.value.toFixed(2)}°`;
  }
  return "";
}


function updateMeasurementRecordDisplay(record) {
  const text = measurementValueText(record);

  if (record.valueElement) {
    record.valueElement.textContent = text;
  }

  if (record.labelObject?.element) {
    record.labelObject.element.textContent = text;
  }
}


function refreshMeasurementHistory() {
  if (!measurementHistory || !measurementHistoryList) {
    return;
  }

  measurementHistory.classList.toggle(
    "has-items",
    measurementRecords.length > 0
  );

  if (measurementHistoryCount) {
    measurementHistoryCount.textContent = String(measurementRecords.length);
  }

  if (measurementHistoryEmpty) {
    measurementHistoryEmpty.style.display =
      measurementRecords.length === 0 ? "block" : "none";
  }
}


function removeMeasurementRecord(recordId) {
  const index = measurementRecords.findIndex(record => record.id === recordId);
  if (index === -1) return;

  const [record] = measurementRecords.splice(index, 1);
  if (record.group) {
    removeMeasurementGroup(record.group);
  }
  if (record.rowElement) {
    record.rowElement.remove();
  }

  refreshMeasurementHistory();
}


function addMeasurementRecord({ type, value, group, labelObject }) {
  measurementRecordSequence += 1;

  const record = {
    id: measurementRecordSequence,
    type,
    value,
    group,
    labelObject,
    valueElement: null,
    rowElement: null
  };

  if (measurementHistoryList) {
    const row = document.createElement("div");
    row.className = "measurement-history-item";

    const nameInput = document.createElement("input");
    nameInput.className = "measurement-history-name";
    nameInput.type = "text";
    nameInput.value = type === "angle"
      ? `Angle ${String(measurementRecordSequence).padStart(2, "0")}`
      : `Measurement ${String(measurementRecordSequence).padStart(2, "0")}`;
    nameInput.setAttribute("aria-label", "Measurement name");

    const valueElement = document.createElement("span");
    valueElement.className = "measurement-history-value";

    const deleteButton = document.createElement("button");
    deleteButton.className = "measurement-history-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete measurement");
    deleteButton.addEventListener("click", () => removeMeasurementRecord(record.id));

    row.append(nameInput, valueElement, deleteButton);
    measurementHistoryList.appendChild(row);

    record.rowElement = row;
    record.valueElement = valueElement;
  }

  measurementRecords.push(record);
  updateMeasurementRecordDisplay(record);
  refreshMeasurementHistory();
}


function updateMeasurementInterface() {

  const buttonModes = [
    [measureDistanceButton, "distance"],
    [measureAngleButton, "angle"]
  ];

  buttonModes.forEach(
    function ([button, mode]) {
      if (!button) return;

      const isActive = measurementMode === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    }
  );

  if (!measurementStatus) return;

  if (measurementMode === "distance") {
    if (pendingMeasurementPoints.length === 0) {
      measurementStatus.textContent = "Distance: select the first point";
    } else {
      measurementStatus.textContent = "Distance: select the second point";
    }
    measurementStatus.style.display = "inline-block";

  } else if (measurementMode === "angle") {
    const angleMessages = [
      "Angle: select the first point",
      "Angle: select the vertex",
      "Angle: select the third point"
    ];

    measurementStatus.textContent =
      angleMessages[pendingMeasurementPoints.length] || angleMessages[0];
    measurementStatus.style.display = "inline-block";

  } else {
    measurementStatus.textContent = "";
    measurementStatus.style.display = "none";
  }
}


function setMeasurementMode(
  mode
) {

  const nextMode =
    measurementMode === mode
      ? null
      : mode;


  cancelPendingMeasurement();


  measurementMode =
    nextMode;


  updateMeasurementInterface();
}


function beginMeasurementGroup() {

  pendingMeasurementGroup =
    new THREE.Group();

  measurementRoot.add(
    pendingMeasurementGroup
  );
}


function addMeasurementPoint(
  point
) {

  if (!pendingMeasurementGroup) {

    beginMeasurementGroup();
  }


  pendingMeasurementPoints.push(
    point
  );


  pendingMeasurementGroup.add(
    createMeasurementMarker(
      point
    )
  );


  if (
    pendingMeasurementPoints.length >
    1
  ) {

    const pointCount =
      pendingMeasurementPoints.length;


    pendingMeasurementGroup.add(
      createMeasurementLine(
        [
          pendingMeasurementPoints[
            pointCount - 2
          ],
          pendingMeasurementPoints[
            pointCount - 1
          ]
        ]
      )
    );
  }
}


function finalizeDistanceMeasurement() {

  const firstPoint = pendingMeasurementPoints[0];
  const secondPoint = pendingMeasurementPoints[1];
  const distanceMeters =
    firstPoint.distanceTo(secondPoint) * MODEL_UNIT_TO_METERS;

  const labelPosition = firstPoint.clone().lerp(secondPoint, 0.5);
  const group = pendingMeasurementGroup;
  const labelObject = createMeasurementLabel(
    formatMeasurementMeters(distanceMeters),
    labelPosition
  );

  group.add(labelObject);

  addMeasurementRecord({
    type: "distance",
    value: distanceMeters,
    group,
    labelObject
  });

  pendingMeasurementGroup = null;
  pendingMeasurementPoints = [];
}


function createAngleArc(
  firstPoint,
  vertexPoint,
  thirdPoint
) {

  const firstDirection =
    firstPoint.clone()
      .sub(
        vertexPoint
      );

  const secondDirection =
    thirdPoint.clone()
      .sub(
        vertexPoint
      );


  const firstLength =
    firstDirection.length();

  const secondLength =
    secondDirection.length();


  if (
    firstLength <= 1e-9 ||
    secondLength <= 1e-9
  ) {

    return null;
  }


  firstDirection.normalize();
  secondDirection.normalize();


  const angle =
    firstDirection.angleTo(
      secondDirection
    );


  const normal =
    new THREE.Vector3()
      .crossVectors(
        firstDirection,
        secondDirection
      );


  if (
    normal.lengthSq() <=
    1e-12
  ) {

    return null;
  }


  normal.normalize();


  const radius =
    Math.min(
      firstLength,
      secondLength
    ) *
    0.24;


  const arcPoints = [];

  const segmentCount =
    40;


  for (
    let index = 0;
    index <= segmentCount;
    index++
  ) {

    const fraction =
      index /
      segmentCount;


    const rotatedDirection =
      firstDirection.clone()
        .applyAxisAngle(
          normal,
          angle * fraction
        );


    arcPoints.push(

      vertexPoint.clone()
        .addScaledVector(
          rotatedDirection,
          radius
        )

    );
  }


  return {
    angle:
      angle,

    line:
      createMeasurementLine(
        arcPoints,
        measurementColor
      ),

    labelPosition:
      vertexPoint.clone()
        .addScaledVector(

          firstDirection.clone()
            .applyAxisAngle(
              normal,
              angle * 0.5
            ),

          radius * 1.18
        )
  };
}


function finalizeAngleMeasurement() {

  const firstPoint = pendingMeasurementPoints[0];
  const vertexPoint = pendingMeasurementPoints[1];
  const thirdPoint = pendingMeasurementPoints[2];
  const group = pendingMeasurementGroup;

  const arc = createAngleArc(firstPoint, vertexPoint, thirdPoint);

  let degrees = 0;
  let labelObject;

  if (arc) {
    group.add(arc.line);
    degrees = THREE.MathUtils.radToDeg(arc.angle);
    labelObject = createMeasurementLabel(
      `${degrees.toFixed(2)}°`,
      arc.labelPosition
    );
    group.add(labelObject);
  } else {
    labelObject = createMeasurementLabel("Undefined angle", vertexPoint);
    group.add(labelObject);
  }

  addMeasurementRecord({
    type: "angle",
    value: degrees,
    group,
    labelObject
  });

  pendingMeasurementGroup = null;
  pendingMeasurementPoints = [];
}


function processMeasurementPoint(
  point
) {

  addMeasurementPoint(
    point
  );


  if (
    measurementMode === "distance" &&
    pendingMeasurementPoints.length === 2
  ) {

    finalizeDistanceMeasurement();

  } else if (
    measurementMode ===
      "angle" &&

    pendingMeasurementPoints.length ===
      3
  ) {

    finalizeAngleMeasurement();
  }


  updateMeasurementInterface();
}


renderer.domElement.addEventListener(
  "pointerdown",
  function (event) {

    if (
      event.button !== 0 ||
      !measurementMode
    ) {
      return;
    }


    measurementPointerDown = {

      x:
        event.clientX,

      y:
        event.clientY

    };

  }
);


renderer.domElement.addEventListener(
  "pointerup",
  function (event) {

    if (
      event.button !== 0 ||
      !measurementMode ||
      !measurementPointerDown
    ) {

      measurementPointerDown =
        null;

      return;
    }


    const movement =
      Math.hypot(

        event.clientX -
          measurementPointerDown.x,

        event.clientY -
          measurementPointerDown.y

      );


    measurementPointerDown =
      null;


    if (
      movement > 5 ||
      sectionDragState
    ) {

      return;
    }


    const point =
      pickMeasurementPoint(
        event
      );


    if (!point) {

      if (measurementStatus) {

        measurementStatus.textContent =
          "No model or point-cloud point was selected";
      }

      return;
    }


    processMeasurementPoint(
      point
    );

  }
);


if (measureDistanceButton) {

  measureDistanceButton.addEventListener(
    "click",
    function () {

      setMeasurementMode(
        "distance"
      );

    }
  );
}


if (measureAngleButton) {

  measureAngleButton.addEventListener(
    "click",
    function () {

      setMeasurementMode(
        "angle"
      );

    }
  );
}


if (clearMeasurementsButton) {

  clearMeasurementsButton.addEventListener(
    "click",
    function () {

      clearMeasurements();
      updateMeasurementInterface();

    }
  );
}


updateMeasurementInterface();




if (measurementUnitSelect) {
  measurementUnit = measurementUnitSelect.value || "m";
  measurementUnitSelect.addEventListener("change", () => {
    measurementUnit = measurementUnitSelect.value || "m";
    measurementRecords.forEach(updateMeasurementRecordDisplay);
  });
}

refreshMeasurementHistory();


// ==================================
// SURVEY PHOTO ARCHIVE
// ==================================

const PHOTO_BATCH_SIZE =
  15;


function createSequentialPhotoCollection(
  folderName,
  filePrefix,
  photoCount,
  captionPrefix
) {

  return Array.from(

    {
      length: photoCount
    },

    function (_, index) {

      const photoNumber =
        index + 1;


      return {

        src:
          `./photos/${folderName}/${filePrefix}(${photoNumber}).JPG`,

        caption:
          `${captionPrefix} ${String(photoNumber).padStart(3, "0")}`

      };

    }

  );
}


const surveyPhotoCollections = {

  exterior:
    createSequentialPhotoCollection(
      "exterior",
      "1_ext_",
      15,
      "Exterior survey photo"
    ),


  interior:
    createSequentialPhotoCollection(
      "interior",
      "1_int_",
      15,
      "Interior survey photo"
    ),


  survey: [

    {
      src: "./photos/survey/survey(1).png",
      caption: "Fieldwork photo 01"
    },

    {
      src: "./photos/survey/survey(2).jpg",
      caption: "Fieldwork photo 02"
    },

    {
      src: "./photos/survey/survey(3).jpg",
      caption: "Fieldwork photo 03"
    },

    {
      src: "./photos/survey/survey(4).png",
      caption: "Fieldwork photo 04"
    },

    {
      src: "./photos/survey/survey(5).png",
      caption: "Fieldwork photo 05"
    },

    {
      src: "./photos/survey/survey(6).png",
      caption: "Fieldwork photo 06"
    },

    {
      src: "./photos/survey/survey(7).png",
      caption: "Fieldwork photo 07"
    },

    {
      src: "./photos/survey/survey(8).png",
      caption: "Fieldwork photo 08"
    },

    {
      src: "./photos/survey/survey(9).png",
      caption: "Fieldwork photo 09"
    },

    {
      src: "./photos/survey/survey(10).png",
      caption: "Fieldwork photo 10"
    },

    {
      src: "./photos/survey/survey(11).png",
      caption: "Fieldwork photo 11"
    }

  ],


  orthophotos: [

    {
      src: "./photos/orthophotos/ortho(1).jpg",
      caption: "Front façade orthophoto"
    },

    {
      src: "./photos/orthophotos/ortho(2).jpg",
      caption: "Side façade orthophoto"
    },

    {
      src: "./photos/orthophotos/ortho(3).jpg",
      caption: "Orthophoto 03"
    }

  ]

};



function preloadCuratedPhotoCollections() {
  ["exterior", "interior"].forEach(category => {
    (surveyPhotoCollections[category] || []).forEach(photo => {
      const image = new Image();
      image.decoding = "async";
      image.src = photo.src;
    });
  });
}


let activePhotoCategory =
  "exterior";

let renderedPhotoCount =
  0;

let activeLightboxPhotoIndex =
  0;

let lightboxZoom =
  1;

let lightboxOffsetX =
  0;

let lightboxOffsetY =
  0;

let lightboxPointerDrag =
  null;


function openViewerDrawer(
  drawer
) {

  const modelScreen = document.getElementById("model-screen");
  if (modelScreen) {
    modelScreen.classList.toggle("viewer-drawer-open", Boolean(drawer));
  }

  [
    surveyPhotoPanel,
    surveyInfoPanel
  ].forEach(
    function (panel) {

      if (!panel) {
        return;
      }


      const isOpen =
        panel === drawer;


      panel.classList.toggle(
        "is-open",
        isOpen
      );

      panel.setAttribute(
        "aria-hidden",
        String(!isOpen)
      );

    }
  );
}


function closeViewerDrawers() {

  openViewerDrawer(
    null
  );
}


function getActivePhotoCollection() {

  return surveyPhotoCollections[
    activePhotoCategory
  ] || [];
}


function setLightboxImageSource(
  photo
) {

  if (!photoLightboxImage) {
    return;
  }


  const sources = [

    photo.resolvedSrc ||
      photo.src,

    photo.src.replace(
      ".JPG",
      ".jpg"
    )

  ].filter(
    function (
      source,
      index,
      list
    ) {

      return source &&
        list.indexOf(source) ===
          index;

    }
  );

  let sourceIndex =
    0;


  function trySource() {

    if (
      sourceIndex >=
      sources.length
    ) {

      photoLightboxImage.removeAttribute(
        "src"
      );

      if (photoLightboxCaption) {

        photoLightboxCaption.textContent =
          `${photo.caption} · Image not found`;
      }

      return;
    }


    photoLightboxImage.src =
      sources[sourceIndex];

    sourceIndex++;
  }


  photoLightboxImage.onerror =
    trySource;

  photoLightboxImage.onload =
    function () {

      photo.resolvedSrc =
        photoLightboxImage.currentSrc ||
        photoLightboxImage.src;
    };


  trySource();
}


function clampLightboxOffsets() {

  if (
    !photoLightboxStage ||
    !photoLightboxImage ||
    lightboxZoom <= 1
  ) {

    lightboxOffsetX =
      0;

    lightboxOffsetY =
      0;

    return;
  }


  const stageWidth =
    photoLightboxStage.clientWidth;

  const stageHeight =
    photoLightboxStage.clientHeight;

  const imageWidth =
    photoLightboxImage.clientWidth *
    lightboxZoom;

  const imageHeight =
    photoLightboxImage.clientHeight *
    lightboxZoom;

  const maximumX =
    Math.max(
      0,
      (
        imageWidth - stageWidth
      ) /
      2
    );

  const maximumY =
    Math.max(
      0,
      (
        imageHeight - stageHeight
      ) /
      2
    );


  lightboxOffsetX =
    THREE.MathUtils.clamp(
      lightboxOffsetX,
      -maximumX,
      maximumX
    );

  lightboxOffsetY =
    THREE.MathUtils.clamp(
      lightboxOffsetY,
      -maximumY,
      maximumY
    );
}


function updateLightboxTransform() {

  if (!photoLightboxImage) {
    return;
  }


  clampLightboxOffsets();


  photoLightboxImage.style.transform =
    `translate(${lightboxOffsetX}px, ${lightboxOffsetY}px) scale(${lightboxZoom})`;

  photoLightboxImage.style.cursor =
    lightboxZoom > 1
      ? "grab"
      : "zoom-in";


  if (photoZoomResetButton) {

    photoZoomResetButton.textContent =
      `${Math.round(lightboxZoom * 100)}%`;
  }
}


function resetLightboxZoom() {

  lightboxZoom =
    1;

  lightboxOffsetX =
    0;

  lightboxOffsetY =
    0;

  updateLightboxTransform();
}


function setLightboxZoom(
  nextZoom,
  anchorX = 0,
  anchorY = 0
) {

  const previousZoom =
    lightboxZoom;

  const clampedZoom =
    THREE.MathUtils.clamp(
      nextZoom,
      1,
      6
    );


  if (
    Math.abs(
      clampedZoom - previousZoom
    ) < 1e-6
  ) {
    return;
  }


  const scaleRatio =
    clampedZoom /
    previousZoom;

  lightboxOffsetX =
    anchorX -
    (
      anchorX - lightboxOffsetX
    ) *
    scaleRatio;

  lightboxOffsetY =
    anchorY -
    (
      anchorY - lightboxOffsetY
    ) *
    scaleRatio;

  lightboxZoom =
    clampedZoom;


  updateLightboxTransform();
}


function preloadLightboxNeighbor(
  index
) {

  const photos =
    getActivePhotoCollection();


  if (photos.length === 0) {
    return;
  }


  const normalizedIndex =
    (
      index + photos.length
    ) %
    photos.length;

  const photo =
    photos[normalizedIndex];

  const image =
    new Image();

  image.src =
    photo.resolvedSrc ||
    photo.src;
}


function showLightboxPhoto(
  index
) {

  const photos =
    getActivePhotoCollection();


  if (
    photos.length === 0 ||
    !photoLightboxImage
  ) {
    return;
  }


  activeLightboxPhotoIndex =
    (
      index + photos.length
    ) %
    photos.length;

  const photo =
    photos[
      activeLightboxPhotoIndex
    ];


  resetLightboxZoom();

  setLightboxImageSource(
    photo
  );

  photoLightboxImage.alt =
    photo.caption;


  if (photoLightboxCaption) {

    photoLightboxCaption.textContent =
      photo.caption;
  }


  if (photoLightboxCounter) {

    photoLightboxCounter.textContent =
      `${activeLightboxPhotoIndex + 1} / ${photos.length}`;
  }


  preloadLightboxNeighbor(
    activeLightboxPhotoIndex - 1
  );

  preloadLightboxNeighbor(
    activeLightboxPhotoIndex + 1
  );
}


function openPhotoLightbox(
  photoIndex
) {

  if (
    !photoLightbox ||
    !photoLightboxImage
  ) {
    return;
  }


  showLightboxPhoto(
    photoIndex
  );


  photoLightbox.classList.add(
    "is-open"
  );

  photoLightbox.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closePhotoLightbox() {

  if (!photoLightbox) {
    return;
  }


  photoLightbox.classList.remove(
    "is-open"
  );

  photoLightbox.setAttribute(
    "aria-hidden",
    "true"
  );


  resetLightboxZoom();


  if (photoLightboxImage) {

    photoLightboxImage.onload =
      null;

    photoLightboxImage.onerror =
      null;

    photoLightboxImage.removeAttribute(
      "src"
    );
  }
}


function createSurveyPhotoCard(
  photo,
  photoIndex
) {

  const card =
    document.createElement(
      "button"
    );

  card.type =
    "button";

  card.className =
    "survey-photo-card";

  card.disabled =
    true;


  const image =
    document.createElement(
      "img"
    );

  image.alt =
    photo.caption;

  image.loading =
    "eager";

  image.decoding =
    "async";


  const placeholder =
    document.createElement(
      "span"
    );

  placeholder.className =
    "survey-photo-placeholder";

  placeholder.innerHTML =
    `<strong>Loading image...</strong><span>${photo.src.replace(/^\.?\/photos\//, "")}</span>`;


  const caption =
    document.createElement(
      "span"
    );

  caption.className =
    "survey-photo-caption";

  caption.textContent =
    photo.caption;


  const sourceCandidates = [

    photo.src,

    photo.src.replace(
      ".JPG",
      ".jpg"
    )

  ];

  let sourceIndex =
    0;


  function tryNextSource() {

    if (
      sourceIndex >=
      sourceCandidates.length
    ) {

      placeholder.innerHTML =
        `<strong>Image not found</strong><span>${photo.src.replace(/^\.?\/photos\//, "")}</span>`;

      card.disabled =
        true;

      return;
    }


    image.src =
      sourceCandidates[
        sourceIndex
      ];

    sourceIndex++;
  }


  image.addEventListener(
    "load",
    function () {

      photo.resolvedSrc =
        image.currentSrc ||
        image.src;

      card.disabled =
        false;

      card.classList.add(
        "has-image"
      );

    }
  );


  image.addEventListener(
    "error",
    tryNextSource
  );


  card.addEventListener(
    "click",
    function () {

      if (card.disabled) {
        return;
      }


      openPhotoLightbox(
        photoIndex
      );

    }
  );


  card.append(
    image,
    placeholder,
    caption
  );


  tryNextSource();


  return card;
}


function renderSurveyPhotoGallery(
  category,
  reset = true
) {

  if (!surveyPhotoGallery) {
    return;
  }


  const photos =
    surveyPhotoCollections[
      category
    ] || [];


  if (reset) {

    surveyPhotoGallery.replaceChildren();

    renderedPhotoCount =
      0;
  }


  const existingLoadMoreButton =
    surveyPhotoGallery.querySelector(
      ".load-more-photos-button"
    );


  if (existingLoadMoreButton) {

    existingLoadMoreButton.remove();
  }


  const nextRenderLimit =
    Math.min(
      renderedPhotoCount +
        PHOTO_BATCH_SIZE,
      photos.length
    );


  for (
    let index = renderedPhotoCount;
    index < nextRenderLimit;
    index++
  ) {

    surveyPhotoGallery.append(
      createSurveyPhotoCard(
        photos[index],
        index
      )
    );
  }


  renderedPhotoCount =
    nextRenderLimit;


  if (
    renderedPhotoCount <
    photos.length
  ) {

    const loadMoreButton =
      document.createElement(
        "button"
      );

    loadMoreButton.type =
      "button";

    loadMoreButton.className =
      "load-more-photos-button";

    loadMoreButton.textContent =
      `Load More (${photos.length - renderedPhotoCount})`;


    loadMoreButton.addEventListener(
      "click",
      function () {

        renderSurveyPhotoGallery(
          category,
          false
        );

      }
    );


    surveyPhotoGallery.append(
      loadMoreButton
    );
  }
}


function updatePhotoCategoryButtons() {

  photoCategoryButtons.forEach(
    function (button) {

      const isActive =
        button.dataset.photoCategory ===
        activePhotoCategory;


      button.classList.toggle(
        "is-active",
        isActive
      );

      button.setAttribute(
        "aria-selected",
        String(isActive)
      );

    }
  );
}


function setActivePhotoCategory(
  category
) {

  activePhotoCategory =
    category;

  updatePhotoCategoryButtons();

  renderSurveyPhotoGallery(
    category,
    true
  );
}


if (openPhotoPanelButton) {

  openPhotoPanelButton.addEventListener(
    "click",
    function () {

      openViewerDrawer(
        surveyPhotoPanel
      );


      window.requestAnimationFrame(
        function () {

          setActivePhotoCategory(
            activePhotoCategory
          );

        }
      );

    }
  );
}


if (openInfoPanelButton) {

  openInfoPanelButton.addEventListener(
    "click",
    function () {

      openViewerDrawer(
        surveyInfoPanel
      );

    }
  );
}


drawerCloseButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      closeViewerDrawers
    );

  }
);


photoCategoryButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        setActivePhotoCategory(
          button.dataset.photoCategory
        );

      }
    );

  }
);


if (closePhotoLightboxButton) {

  closePhotoLightboxButton.addEventListener(
    "click",
    closePhotoLightbox
  );
}


if (photoLightboxPreviousButton) {

  photoLightboxPreviousButton.addEventListener(
    "click",
    function () {

      showLightboxPhoto(
        activeLightboxPhotoIndex - 1
      );

    }
  );
}


if (photoLightboxNextButton) {

  photoLightboxNextButton.addEventListener(
    "click",
    function () {

      showLightboxPhoto(
        activeLightboxPhotoIndex + 1
      );

    }
  );
}


if (photoZoomOutButton) {

  photoZoomOutButton.addEventListener(
    "click",
    function () {

      setLightboxZoom(
        lightboxZoom - 0.25
      );

    }
  );
}


if (photoZoomResetButton) {

  photoZoomResetButton.addEventListener(
    "click",
    resetLightboxZoom
  );
}


if (photoZoomInButton) {

  photoZoomInButton.addEventListener(
    "click",
    function () {

      setLightboxZoom(
        lightboxZoom + 0.25
      );

    }
  );
}


if (photoLightboxStage) {

  photoLightboxStage.addEventListener(
    "wheel",
    function (event) {

      event.preventDefault();


      const bounds =
        photoLightboxStage
          .getBoundingClientRect();

      const anchorX =
        event.clientX -
        bounds.left -
        bounds.width / 2;

      const anchorY =
        event.clientY -
        bounds.top -
        bounds.height / 2;

      const zoomChange =
        event.deltaY < 0
          ? 0.25
          : -0.25;


      setLightboxZoom(
        lightboxZoom +
          zoomChange,
        anchorX,
        anchorY
      );

    },
    {
      passive:
        false
    }
  );


  photoLightboxStage.addEventListener(
    "dblclick",
    function () {

      if (lightboxZoom > 1) {

        resetLightboxZoom();

      } else {

        setLightboxZoom(
          2
        );
      }

    }
  );


  photoLightboxStage.addEventListener(
    "pointerdown",
    function (event) {

      if (lightboxZoom <= 1) {
        return;
      }


      lightboxPointerDrag = {

        pointerId:
          event.pointerId,

        startX:
          event.clientX,

        startY:
          event.clientY,

        offsetX:
          lightboxOffsetX,

        offsetY:
          lightboxOffsetY

      };


      photoLightboxStage.setPointerCapture(
        event.pointerId
      );

      photoLightboxStage.classList.add(
        "is-dragging"
      );

    }
  );


  photoLightboxStage.addEventListener(
    "pointermove",
    function (event) {

      if (
        !lightboxPointerDrag ||
        lightboxPointerDrag.pointerId !==
          event.pointerId
      ) {
        return;
      }


      lightboxOffsetX =
        lightboxPointerDrag.offsetX +
        event.clientX -
        lightboxPointerDrag.startX;

      lightboxOffsetY =
        lightboxPointerDrag.offsetY +
        event.clientY -
        lightboxPointerDrag.startY;


      updateLightboxTransform();

    }
  );


  function finishLightboxDrag(
    event
  ) {

    if (
      !lightboxPointerDrag ||
      lightboxPointerDrag.pointerId !==
        event.pointerId
    ) {
      return;
    }


    lightboxPointerDrag =
      null;

    photoLightboxStage.classList.remove(
      "is-dragging"
    );
  }


  photoLightboxStage.addEventListener(
    "pointerup",
    finishLightboxDrag
  );

  photoLightboxStage.addEventListener(
    "pointercancel",
    finishLightboxDrag
  );
}


if (photoLightbox) {

  photoLightbox.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        photoLightbox
      ) {

        closePhotoLightbox();
      }

    }
  );
}


window.addEventListener(
  "keydown",
  function (event) {

    const isLightboxOpen =
      photoLightbox &&
      photoLightbox.classList.contains(
        "is-open"
      );


    if (
      isLightboxOpen &&
      event.key === "ArrowLeft"
    ) {

      showLightboxPhoto(
        activeLightboxPhotoIndex - 1
      );

      return;
    }


    if (
      isLightboxOpen &&
      event.key === "ArrowRight"
    ) {

      showLightboxPhoto(
        activeLightboxPhotoIndex + 1
      );

      return;
    }


    if (
      isLightboxOpen &&
      (
        event.key === "+" ||
        event.key === "="
      )
    ) {

      setLightboxZoom(
        lightboxZoom + 0.25
      );

      return;
    }


    if (
      isLightboxOpen &&
      event.key === "-"
    ) {

      setLightboxZoom(
        lightboxZoom - 0.25
      );

      return;
    }


    if (
      event.key ===
      "Escape"
    ) {

      closePhotoLightbox();
      closeViewerDrawers();

      if (measurementMode) {

        setMeasurementMode(
          measurementMode
        );
      }
    }

  }
);


updatePhotoCategoryButtons();


// ==================================
// CHECKBOX CONTROLS
// ==================================

const allCheckboxes =
  Array.from(

    document.querySelectorAll(
      "[data-layer]"
    )

  );


const supportedCheckboxes =
  [];


allCheckboxes.forEach(
  function (checkbox) {

    const layerKey =
      checkbox.dataset.layer;


    if (
      !layerFiles[
        layerKey
      ]
    ) {

      checkbox.checked =
        false;

      checkbox.disabled =
        true;

      return;
    }


    supportedCheckboxes.push(
      checkbox
    );


    checkbox.addEventListener(
      "change",

      async function () {

        if (
          checkbox.checked
        ) {

          try {

            await loadLayer(
              layerKey
            );

          } catch (error) {

            checkbox.checked =
              false;
          }

        } else {

          if (
            loadedLayers[
              layerKey
            ]
          ) {

            loadedLayers[
              layerKey
            ].visible =
              false;

          }

          updateGroundPlane();
          updateAutomaticModelPointCloudOpacity();
        }

      }
    );

  }
);


// ==================================
// DECAY DETECTION GROUP CONTROLS
// ==================================

const decayLayerCheckboxes =
  supportedCheckboxes.filter(
    function (checkbox) {

      return isDecayLayer(
        checkbox.dataset.layer
      );

    }
  );


function updateDecayMasterState() {

  if (!decayMasterCheckbox) {
    return;
  }


  const checkedCount =
    decayLayerCheckboxes.filter(
      function (checkbox) {

        return checkbox.checked;

      }
    ).length;


  decayMasterCheckbox.checked =
    checkedCount ===
    decayLayerCheckboxes.length &&
    decayLayerCheckboxes.length > 0;


  decayMasterCheckbox.indeterminate =
    checkedCount > 0 &&
    checkedCount <
      decayLayerCheckboxes.length;
}


decayLayerCheckboxes.forEach(
  function (checkbox) {

    checkbox.addEventListener(
      "change",
      updateDecayMasterState
    );

  }
);


if (decayMasterCheckbox) {

  decayMasterCheckbox.addEventListener(
    "change",

    async function () {

      const shouldShow =
        decayMasterCheckbox.checked;


      decayMasterCheckbox.indeterminate =
        false;


      for (
        const checkbox
        of decayLayerCheckboxes
      ) {

        checkbox.checked =
          shouldShow;


        const layerKey =
          checkbox.dataset.layer;


        if (shouldShow) {

          try {

            await loadLayer(
              layerKey
            );

          } catch (error) {

            checkbox.checked =
              false;
          }

        } else if (
          loadedLayers[layerKey]
        ) {

          loadedLayers[layerKey].visible =
            false;
        }
      }


      updateDecayMasterState();
      updateGroundPlane();

    }
  );
}


decayColorInputs.forEach(
  function (input) {

    const layerKey =
      input.dataset.decayColor;


    if (!isDecayLayer(layerKey)) {

      input.disabled =
        true;

      return;
    }


    decayLayerColors[layerKey] =
      input.value ||
      "#000000";


    input.addEventListener(
      "input",

      function () {

        setDecayLayerColor(
          layerKey,
          input.value
        );

      }
    );

  }
);


if (decayLineThicknessInput) {

  decayLineThickness =
    parseFloat(
      decayLineThicknessInput.value
    ) || 0.8;


  updateAllDecayLineThickness(
    decayLineThickness
  );


  decayLineThicknessInput.addEventListener(
    "input",
    function () {

      updateAllDecayLineThickness(
        parseFloat(
          decayLineThicknessInput.value
        )
      );

    }
  );
}


updateDecayMasterState();




// ==================================
// PROFESSIONAL LAYER CONTROLS
// ==================================
// MODEL DISPLAY SELECTS
// ==================================

modelDisplaySelects.forEach(
  function (select) {

    const layerKey =
      select.dataset.displayMode;


    if (!isModelLayer(layerKey)) {
      select.disabled = true;
      return;
    }


    modelDisplayModes[layerKey] =
      select.value;


    select.addEventListener(
      "change",
      function () {

        setModelDisplayMode(
          layerKey,
          select.value
        );

      }
    );

  }
);


// ==================================
// POINT-CLOUD DISPLAY SELECTS
// ==================================

pointDisplaySelects.forEach(
  function (select) {

    const layerKey =
      select.dataset.pointDisplayMode;


    if (!isPointCloudLayer(layerKey)) {

      select.disabled =
        true;

      return;
    }


    pointDisplayModes[layerKey] =
      select.value;


    select.addEventListener(
      "change",
      function () {

        setPointDisplayMode(
          layerKey,
          select.value
        );

      }
    );

  }
);


// ==================================
// POINT-CLOUD SIZE SLIDERS
// ==================================

pointSizeInputs.forEach(function (input) {
  const layerKey = input.dataset.pointSize;

  if (!isPointCloudLayer(layerKey)) {
    input.disabled = true;
    return;
  }

  const initialValue = Number(input.value);
  if (Number.isFinite(initialValue)) {
    pointSizePixels[layerKey] = THREE.MathUtils.clamp(initialValue, 0.4, 2.4);
  }

  updatePointSizeControlValue(layerKey);

  input.addEventListener("input", function (event) {
    event.stopPropagation();

    pointSizePixels[layerKey] = THREE.MathUtils.clamp(
      Number(input.value) || 0.8,
      0.4,
      2.4
    );

    updatePointSizeControlValue(layerKey);
    applyPointSizeControlToLayer(layerKey);
  });

  input.addEventListener("change", function (event) {
    event.stopPropagation();
    applyPointSizeControlToLayer(layerKey);
  });
});


// ==================================
// DECAY INFORMATION CONTROLS
// ==================================

decayInfoButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    openDecayInformation(button.dataset.decayInfo);
  });
});

if (closeAnalysisInspectorButton) {
  closeAnalysisInspectorButton.addEventListener("click", closeDecayInformation);
}


// ==================================
// USER APPEARANCE CONTROLS
// ==================================

modelColorInputs.forEach(function (input) {
  const layerKey = input.dataset.modelColor;
  if (!isModelLayer(layerKey)) return;
  input.addEventListener("input", function () {
    setModelLayerColor(layerKey, input.value);
  });
});

layerOpacityInputs.forEach(function (input) {
  const layerKey = input.dataset.layerOpacity;
  if (!layerFiles[layerKey]) return;
  const valueLabel = document.querySelector(`[data-opacity-value="${layerKey}"]`);

  function syncOpacity() {
    const opacity = Number(input.value);
    setLayerOpacity(layerKey, opacity);
    if (valueLabel) valueLabel.textContent = `${Math.round(opacity * 100)}%`;
  }

  input.addEventListener("input", syncOpacity);
});

const backgroundPresets = {
  porcelain: { top: "#f3f4f3", bottom: "#d9dde0" },
  ivory: { top: "#f3efe6", bottom: "#d8d2c7" },
  graphite: { top: "#51565c", bottom: "#262a2f" },
  warm: { top: "#817d76", bottom: "#4d4b48" },
  bluegrey: { top: "#71808b", bottom: "#43515d" }
};

let activeBackgroundTexture = null;

function disposeActiveBackgroundTexture() {
  if (activeBackgroundTexture) {
    activeBackgroundTexture.dispose();
    activeBackgroundTexture = null;
  }
}

function setBackgroundPreset(name) {
  const preset = backgroundPresets[name] || backgroundPresets.porcelain;
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, preset.top);
  gradient.addColorStop(1, preset.bottom);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  disposeActiveBackgroundTexture();
  activeBackgroundTexture = texture;
  scene.background = texture;

  backgroundPresetButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.backgroundPreset === name);
  });
  document.querySelector(".background-custom-swatch")?.classList.remove("is-active");
}

function setCustomBackground(color) {
  disposeActiveBackgroundTexture();
  scene.background = new THREE.Color(color);
  backgroundPresetButtons.forEach(function (button) {
    button.classList.remove("is-active");
  });
  document.querySelector(".background-custom-swatch")?.classList.add("is-active");
}

backgroundPresetButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setBackgroundPreset(button.dataset.backgroundPreset);
  });
});

if (backgroundCustomInput) {
  backgroundCustomInput.addEventListener("input", function () {
    setCustomBackground(backgroundCustomInput.value);
  });
}

setBackgroundPreset("graphite");

if (measurementColorInput) {
  measurementColorInput.addEventListener("input", function () {
    measurementColor = measurementColorInput.value;
    applyMeasurementColorToExisting();
  });
}


// ==================================
// LOAD INITIAL LAYERS
// ==================================

async function loadInitialLayers() {

  for (
    const checkbox
    of supportedCheckboxes
  ) {

    if (
      !checkbox.checked
    ) {
      continue;
    }


    try {

      await loadLayer(
        checkbox.dataset.layer
      );

    } catch (error) {

      checkbox.checked =
        false;
    }

  }


  updateAutomaticModelPointCloudOpacity();
  fitCameraToVisibleLayers();
}


// ==================================
// MAIN VIEWER BUTTONS
// ==================================

const showAllButton =
  document.getElementById(
    "show-all"
  );

const hideAllButton =
  document.getElementById(
    "hide-all"
  );



if (
  showAllButton
) {

  showAllButton.addEventListener(
    "click",

    async function () {

      for (
        const checkbox
        of supportedCheckboxes
      ) {

        checkbox.checked =
          true;


        try {

          await loadLayer(
            checkbox.dataset.layer
          );

        } catch (error) {

          checkbox.checked =
            false;
        }

      }


      updateDecayMasterState();
      updateGroundPlane();
      updateAutomaticModelPointCloudOpacity();
    }
  );
}


if (
  hideAllButton
) {

  hideAllButton.addEventListener(
    "click",

    function () {

      supportedCheckboxes
        .forEach(

          function (checkbox) {

            checkbox.checked =
              false;


            const layerKey =
              checkbox.dataset.layer;


            if (
              loadedLayers[
                layerKey
              ]
            ) {

              loadedLayers[
                layerKey
              ].visible =
                false;

            }

          }

        );

      updateDecayMasterState();
      updateGroundPlane();
      updateAutomaticModelPointCloudOpacity();
    }
  );
}


// ==================================
// GROUND / SECTION TOGGLES
// ==================================

if (toggleGroundButton) {

  toggleGroundButton.addEventListener(
    "click",
    function () {

      setGroundEnabled(
        !groundEnabled
      );

    }
  );
}


if (toggleSectionButton) {

  toggleSectionButton.addEventListener(
    "click",
    function () {

      setSectionBoxEnabled(
        !sectionBoxEnabled
      );

    }
  );
}






// ==================================
// WINDOW RESIZE
// ==================================

window.addEventListener(
  "resize",

  function () {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    renderer.setPixelRatio(

      Math.min(
        window.devicePixelRatio,
        VIEWER_PIXEL_RATIO_CAP
      )

    );


    labelRenderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    updateAnalysisLineMaterialResolutions();

  }
);




// ==================================
// DECAY PICKING
// ==================================

const analysisRaycaster = new THREE.Raycaster();
const analysisPointer = new THREE.Vector2();
analysisRaycaster.params.Line = { threshold: 0.02 };
analysisRaycaster.params.Points.threshold = 0.02;

function setAnalysisPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  analysisPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  analysisPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  analysisRaycaster.setFromCamera(analysisPointer, camera);
  const threshold = getMeasurementSceneScale() * 0.0015;
  analysisRaycaster.params.Line.threshold = threshold;
  analysisRaycaster.params.Points.threshold = Math.max(threshold, getMeasurementSceneScale() * 0.0008);
}

renderer.domElement.addEventListener("click", event => {
  if (measurementMode) return;
  setAnalysisPointer(event);

  for (const key of decayLayerKeys) {
    const layer = loadedLayers[key];
    if (!layer?.visible) continue;
    const hits = analysisRaycaster.intersectObject(layer, true);
    if (hits.length) {
      openDecayInformation(key);
      return;
    }
  }
});


// ==================================
// ANIMATION LOOP
// ==================================

let lastStaticRenderTime = 0;

renderer.setAnimationLoop(function (time) {
  const controlsChanged = Boolean(controls.update());

  if (controlsChanged) {
    setAdaptivePointCloudInteraction(true);
    scheduleFullPointCloudQuality();
  }

  if (controlsChanged || adaptivePointCloudInteractionActive) {
    updateAdaptivePointCloudSizes();
  }

  updateGroundVisibilityForCamera();

  if (sectionBoxEnabled) {
    updateSectionHandles();
  }

  const modelScreen = document.getElementById("model-screen");
  if (modelScreen?.classList.contains("is-hidden")) {
    return;
  }

  const activeInteraction =
    adaptivePointCloudInteractionActive ||
    Boolean(sectionDragState) ||
    sectionTransformDragging;

  // During interaction, render every frame with the lightweight proxies.
  // When stationary, the full survey returns but the unchanged canvas is
  // throttled to ~12 fps instead of re-drawing 15M+ points at 60 fps.
  if (
    activeInteraction ||
    controlsChanged ||
    time - lastStaticRenderTime >= STATIC_RENDER_INTERVAL_MS
  ) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    if (!activeInteraction) {
      lastStaticRenderTime = time;
    }
  }
});


// ==================================
// START MODEL VIEWER ON REQUEST
// ==================================

function startModelViewerOnce() {

  if (
    modelViewerStarted
  ) {
    return;
  }


  modelViewerStarted =
    true;

  window.setTimeout(preloadCuratedPhotoCollections, 2500);


  loadInitialLayers()
    .catch(
      function (error) {

        console.error(
          "Model viewer initialization failed:",
          error
        );

        showLoading(
          "Could not load the model"
        );

        modelViewerStarted =
          false;

      }
    );
}


window.addEventListener(
  "openModelViewer",
  startModelViewerOnce
);


/*
Fallback: if the model screen became visible
before this module finished loading, start it now.
*/

window.requestAnimationFrame(
  function () {

    const modelScreen =
      document.getElementById(
        "model-screen"
      );


    if (
      modelScreen &&
      !modelScreen.classList.contains(
        "is-hidden"
      )
    ) {

      startModelViewerOnce();
    }

  }
);

