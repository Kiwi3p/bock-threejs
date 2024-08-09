"use client"; // Ensure this component is a client component

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import Stats from 'three/examples/jsm/libs/stats.module';

const ObjScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let camera, scene, renderer, stats, mainObject, objects = [];
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical();
    let center = new THREE.Vector3(0, 0, 0); // Center of rotation
    let radius = 20; // Initial distance of the camera from the object

    function init() {
      // Setup scene
      scene = new THREE.Scene();

      // Setup camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      spherical.set(radius, Math.PI / 2, 0); // Set initial spherical coordinates
      updateCameraPosition();

      // Setup renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Add stats
      stats = new Stats();
      mountRef.current.appendChild(stats.dom);

      // Add gradient background
      const gradientTexture = new THREE.CanvasTexture(generateGradient());
      scene.background = gradientTexture;

      // Add basic ambient light
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      // Add a directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5).normalize();
      scene.add(directionalLight);

      // Load MTL file and then OBJ file
      const mtlLoader = new MTLLoader();
      mtlLoader.load('/models/obj/textured.mtl', (materials) => {
        materials.preload(); // Preload the materials

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials); // Apply materials to the OBJ loader

        objLoader.load('/models/obj/textured.obj', (loadedObject) => {
          mainObject = loadedObject;
          mainObject.position.set(0, 0, 0); // Center the main object
          mainObject.scale.set(8, 8, 8); // Scale up the main object
          scene.add(mainObject);

          // Create and position 12 copies of the object
          for (let i = 0; i < 12; i++) {
            const objCopy = loadedObject.clone();
            const angle = (i / 12) * Math.PI * 2; // Angle for positioning in a circle
            const copyRadius = 10;
            objCopy.position.set(Math.cos(angle) * copyRadius, Math.sin(angle) * copyRadius, -10);
            objCopy.scale.set(5, 5, 5); // Slightly smaller than the main object
            objects.push(objCopy);
            scene.add(objCopy);
          }
        }, undefined, (error) => {
          console.error("An error occurred while loading the OBJ model:", error);
        });
      });

      // Handle window resize
      window.addEventListener('resize', onWindowResize);

      // Mouse event listeners for dragging
      renderer.domElement.addEventListener('mousedown', onMouseDown, false);
      renderer.domElement.addEventListener('mousemove', onMouseMove, false);
      renderer.domElement.addEventListener('mouseup', onMouseUp, false);
      renderer.domElement.addEventListener('mouseleave', onMouseUp, false);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        if (mainObject) {
          mainObject.rotation.y += 0.01; // Rotate the main object
        }
        objects.forEach((obj) => {
          obj.rotation.y += 0.005; // Rotate each copy slightly slower
        });
        renderer.render(scene, camera);
        stats.update();
      };
      animate();
    }

    function generateGradient() {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;

      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#F3E100');
      gradient.addColorStop(1, '#01B9DA');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return canvas;
    }

    function updateCameraPosition() {
      // Update the camera's position based on spherical coordinates
      camera.position.setFromSpherical(spherical).add(center);
      camera.lookAt(center);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseDown(event) {
      isDragging = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    }

    function onMouseMove(event) {
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        spherical.theta -= toRadians(deltaMove.x * 0.5);
        spherical.phi -= toRadians(deltaMove.y * 0.5);

        // Constrain the phi angle to prevent the camera from flipping
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        updateCameraPosition();

        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      }
    }

    function onMouseUp() {
      isDragging = false;
    }

    function toRadians(angle) {
      return angle * (Math.PI / 180);
    }

    init();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown, false);
        renderer.domElement.removeEventListener('mousemove', onMouseMove, false);
        renderer.domElement.removeEventListener('mouseup', onMouseUp, false);
        renderer.domElement.removeEventListener('mouseleave', onMouseUp, false);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ObjScene;
