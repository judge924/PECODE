import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TensorSphereHero: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // 1. Scene & Deep Cosmic Camera
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
        camera.position.z = 160;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // 2. 전체 구체를 회전시킬 최상위 그룹
        const sphereGroup = new THREE.Group();
        scene.add(sphereGroup);

        // 3. 배경 항성계 별밭 (12,000개 상시 은하수)
        const bgCount = 12000;
        const bgPos = new Float32Array(bgCount * 3);
        for (let i = 0; i < bgCount; i++) {
            const i3 = i * 3;
            const r = 500 + Math.random() * 700;
            const u = Math.random(), v = Math.random();
            const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
            bgPos[i3] = r * Math.sin(ph) * Math.cos(th);
            bgPos[i3 + 1] = r * Math.sin(ph) * Math.sin(th);
            bgPos[i3 + 2] = r * Math.cos(ph);
        }
        const bgGeo = new THREE.BufferGeometry();
        bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
        const bgPoints = new THREE.Points(
            bgGeo,
            new THREE.PointsMaterial({ size: 0.35, color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false })
        );
        scene.add(bgPoints);

        // 4. 순수 피보나치 나노 천체 구체 (8,500개 입자)
        const count = 8500;
        const sphereRadius = 66;
        const sphere = new Float32Array(count * 3);
        const initial = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const delays = new Float32Array(count);

        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const y = 1 - (i / (count - 1)) * 2;
            const rAtY = Math.sqrt(1 - y * y);
            const theta = golden * i;

            sphere[i3] = Math.cos(theta) * rAtY * sphereRadius;
            sphere[i3 + 1] = y * sphereRadius;
            sphere[i3 + 2] = Math.sin(theta) * rAtY * sphereRadius;

            const r = 350 + Math.random() * 450;
            const u = Math.random(), v = Math.random();
            const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
            initial[i3] = r * Math.sin(ph) * Math.cos(th);
            initial[i3 + 1] = r * Math.sin(ph) * Math.sin(th);
            initial[i3 + 2] = r * Math.cos(ph);

            delays[i] = Math.random() * 2.2;
            const lum = 0.35 + Math.random() * 0.35;
            colors[i3] = lum * 0.92;
            colors[i3 + 1] = lum * 0.94;
            colors[i3 + 2] = lum;
            sizes[i] = 0.4 + Math.random() * 0.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(initial, 3));
        geo.setAttribute('aInitial', new THREE.BufferAttribute(initial, 3));
        geo.setAttribute('aTarget', new THREE.BufferAttribute(sphere, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));

        const mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            uniforms: { uProgress: { value: 0 }, uTime: { value: 0 } },
            vertexShader: `
        attribute vec3 aInitial;
        attribute vec3 aTarget;
        attribute float size;
        attribute float aDelay;
        uniform float uProgress;
        uniform float uTime;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vDepth;

        float easeOutExpo(float x){ return x == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x); }

        void main(){
          vColor = color;
          float p = clamp((uProgress - aDelay * 0.12) / 0.85, 0.0, 1.0);
          float ep = easeOutExpo(p);

          vec3 finalPos = mix(aInitial, aTarget, ep);
          finalPos += normalize(aTarget) * sin(uTime * 0.2 + aDelay * 3.0) * 0.12 * ep;

          vec4 mv = modelViewMatrix * vec4(finalPos, 1.0);
          vDepth = -mv.z;
          vAlpha = clamp(0.25 + ep * 0.75, 0.0, 1.0);
          gl_PointSize = size * (280.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vDepth;
        void main(){
          float d = distance(gl_PointCoord, vec2(0.5));
          if(d > 0.5) discard;
          float dot = 1.0 - smoothstep(0.0, 0.48, d);
          float alpha = dot * 0.75 * vAlpha;
          float depthFade = smoothstep(90.0, 260.0, vDepth);
          alpha *= (1.0 - depthFade * 0.7);
          gl_FragColor = vec4(vColor, alpha);
        }
      `
        });

        const points = new THREE.Points(geo, mat);
        sphereGroup.add(points);

        // 5. 마우스 드래그 인터랙션 & 렌더 루프
        let tx = 0, ty = 0, cx = 0, cy = 0, isDragging = false, px = 0, py = 0;

        const down = (e: any) => {
            isDragging = true;
            px = e.touches ? e.touches[0].clientX : e.clientX;
            py = e.touches ? e.touches[0].clientY : e.clientY;
        };

        const move = (e: any) => {
            if (!isDragging) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            tx += (x - px) * 0.0022;
            ty += (y - py) * 0.0022;
            px = x;
            py = y;
        };

        const up = () => {
            isDragging = false;
        };

        window.addEventListener('mousedown', down);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchstart', down, { passive: true });
        window.addEventListener('touchmove', move, { passive: true });
        window.addEventListener('touchend', up);

        const start = performance.now();
        let id = 0;

        const animate = () => {
            id = requestAnimationFrame(animate);
            const elapsed = (performance.now() - start) / 1000;
            const prog = Math.min(elapsed / 6.5, 1.0);

            mat.uniforms.uProgress.value = prog;
            mat.uniforms.uTime.value = elapsed;

            if (!isDragging) tx += 0.00006;
            cx += (tx - cx) * 0.02;
            cy += (ty - cy) * 0.02;

            sphereGroup.rotation.y = cx;
            sphereGroup.rotation.x = cy;

            bgPoints.rotation.y += 0.00004;

            renderer.render(scene, camera);
        };

        animate();

        const onResize = () => {
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousedown', down);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchstart', down);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
            geo.dispose();
            mat.dispose();
            bgGeo.dispose();
            renderer.dispose();
            container.innerHTML = '';
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: 'calc(100vh - 44px)',
                background: '#000',
                overflow: 'hidden'
            }}
            className="cursor-grab active:cursor-grabbing select-none"
        />
    );
};

export default TensorSphereHero;