const clamp=value=>Math.min(1,Math.max(0,value));
export const ease=value=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10);};
export function gallerySequence(progress){
  const p=clamp(progress),travel=clamp((p-.08)/.72)*2;
  return {travel,index:Math.round(travel),exit:ease((p-.84)/.16)};
}
