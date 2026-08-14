# Thesis Site V43

Final pre-publish rendering fixes:

- Ground is now grid-only; the opaque solid ground plane has been removed.
- Ground grid does not write to the depth buffer.
- Exterior Model automatically switches to 50% opacity whenever Exterior Point Cloud or Left Point Cloud is visible at the same time.
- Interior Model automatically switches to 50% opacity whenever Interior Point Cloud is visible at the same time.
- When the matching point cloud is hidden, the model returns to its previous opacity.
- Existing DRC loading, adaptive point-cloud performance, point-size controls, section box, measurements, decay layers and intro are preserved.


## V44 fixed ground grid
- Ground is created once from the Exterior Model reference bounds.
- Toggling any model, point cloud, or decay layer no longer changes the grid size, position, or visibility.
- Ground visibility is controlled only by the Ground button.
- Grid remains transparent with no solid plane.


## V45 fixed world grid + mobile depth fix
- Ground grid is now a permanent world-space grid (120 units, 60 divisions, Y=-0.03) and has no dependency on Exterior Model or any other layer. Only the Ground button changes its visibility.
- Reduced the Three.js camera near/far depth range to recover depth-buffer precision, especially on mobile GPUs.
- Added polygon depth offset to architectural model meshes (stronger on mobile) so model + matching point cloud can coexist without visible z-fighting while keeping the existing automatic 50% model opacity.
- Updated cache-busting to `heritage-platform-45-world-grid-mobile-depth`.

## V46 mobile panel collision fix
- On phone/tablet widths, the floating Measurement and Survey tool stacks automatically hide whenever the 3D Model Explorer sidebar is open.
- They return automatically when the sidebar is collapsed, preventing left/right UI overlap without changing desktop layout or viewer behavior.


## V47 final pre-publish fixes
- Removed Point Cloud Intensity Grayscale choices; point clouds use original RGB colors.
- Added a small Opacity label before every layer opacity slider.
- Mobile Photos/Information drawers now suppress the sidebar handle while open, preventing overlap with the drawer close button.
- Main 3D module is module-preloaded, and point-cloud/model assets are warmed into the HTTP cache during the cinematic intro without decoding them during the intro.


## V48 final folder structure
Asset paths updated for the final repository layout:
- `models/` — exterior and interior GLB models
- `pointclouds/` — exterior/interior DRC and left GLB point clouds
- `decay/` — four JSON decay layers
- `photos/assets/` — team and equipment images
- `photos/exterior/`, `photos/interior/`, `photos/survey/`, `photos/orthophotos/` — survey archive
- `photos/italy-sequence/` — intro montage images

Photo URLs are repository-relative so the site works correctly on GitHub Pages project URLs. Mobile and desktop use the same final point-cloud files; mobile performance is controlled by adaptive rendering rather than separate asset filenames.


## V51 Clean Performance
- Point-cloud files are no longer prefetched during the intro; they load on demand when their layer is enabled.
- Idle Three.js redraws are reduced. Interaction behavior, photo behavior, UI, layer behavior, and asset paths are unchanged from V48.
