import LightRays from '@/components/LightRays';

/** Same animated light-rays backdrop as the hero. Place inside an `isolate` parent. */
const RaysBackground = ({ fixed = false }: { fixed?: boolean }) => (
  <div
    aria-hidden="true"
    className={`${fixed ? 'fixed' : 'absolute'} inset-0 -z-10 opacity-25 pointer-events-none`}
  >
    <LightRays
      raysOrigin="top-center"
      raysSpeed={0.8}
      lightSpread={0.6}
      rayLength={1.2}
      followMouse
      mouseInfluence={0.1}
      fadeDistance={1.2}
      saturation={0}
    />
  </div>
);

export default RaysBackground;
