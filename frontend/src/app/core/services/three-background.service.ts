import { Injectable, OnDestroy } from '@angular/core';

/**
 * Service Three.js — fond 3D réutilisable sur toutes les pages.
 * Particules + anneaux + icosaèdres en wireframe.
 */
@Injectable({ providedIn: 'root' })
export class ThreeBackgroundService implements OnDestroy {
  private renderer: any = null;
  private animFrameId: number | null = null;
  private initialized = false;

  init(canvasId: string): void {
    if (this.initialized) return;
    const THREE = (window as any)['THREE'];
    if (!THREE) { console.warn('Three.js non chargé'); return; }

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    // Particules
    const count = 250;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 40;
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pmat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.055, transparent: true, opacity: 0.45 });
    const particles = new THREE.Points(pgeo, pmat);
    scene.add(particles);

    // Anneaux
    const rings: any[] = [];
    for (let i = 0; i < 4; i++) {
      const rg = new THREE.TorusGeometry(3 + i * 2.5, 0.04, 8, 80);
      const rm = new THREE.MeshBasicMaterial({ color: 0x16a34a, transparent: true, opacity: 0.055, wireframe: true });
      const r = new THREE.Mesh(rg, rm);
      r.rotation.x = Math.random() * Math.PI;
      r.rotation.y = Math.random() * Math.PI;
      r.position.z = -8 - i * 3;
      scene.add(r);
      rings.push(r);
    }

    // Icosaèdres
    const isos: any[] = [];
    for (let i = 0; i < 5; i++) {
      const ig = new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.35, 0);
      const im = new THREE.MeshBasicMaterial({ color: 0x16a34a, transparent: true, opacity: 0.1, wireframe: true });
      const iso = new THREE.Mesh(ig, im);
      iso.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 6);
      scene.add(iso);
      isos.push(iso);
    }

    // Souris
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMouse = (e: MouseEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = -(e.clientY / window.innerHeight - 0.5) * 2;
      const glow = document.getElementById('pv-cursor-glow');
      if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
    };
    document.addEventListener('mousemove', onMouse);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      particles.rotation.y = t * 0.025 + mx * 0.08;
      particles.rotation.x = t * 0.01 + my * 0.04;
      rings.forEach((r, i) => {
        r.rotation.x += 0.0008 * (i + 1);
        r.rotation.z += 0.001 * (i + 0.5);
        r.material.opacity = 0.04 + 0.035 * Math.sin(t * 0.5 + i);
      });
      isos.forEach((iso, i) => {
        iso.rotation.x += 0.005;
        iso.rotation.y += 0.007;
        iso.position.y += Math.sin(t * 0.4 + i * 1.3) * 0.003;
      });
      camera.position.x += (mx * 0.4 - camera.position.x) * 0.03;
      camera.position.y += (my * 0.25 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      this.renderer.render(scene, camera);
    };
    animate();
    this.initialized = true;
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
