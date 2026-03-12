import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
  ]);
  
  modelsLoaded = true;
}

export interface FaceResult {
  id: number;
  box: { x: number; y: number; width: number; height: number };
  expressions: Record<string, number>;
  age: number;
  gender: string;
  genderProbability: number;
  landmarks: faceapi.FaceLandmarks68;
  descriptor: Float32Array;
}

export async function detectFaces(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, useFastMode = false): Promise<FaceResult[]> {
  const options = useFastMode
    ? new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
    : new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

  const detections = await faceapi
    .detectAllFaces(image, options)
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender()
    .withFaceDescriptors();

  return detections.map((d, i) => ({
    id: i,
    box: {
      x: d.detection.box.x,
      y: d.detection.box.y,
      width: d.detection.box.width,
      height: d.detection.box.height,
    },
    expressions: d.expressions as unknown as Record<string, number>,
    age: Math.round(d.age),
    gender: d.gender,
    genderProbability: d.genderProbability,
    landmarks: d.landmarks,
    descriptor: d.descriptor,
  }));
}

// Simple face recognition using stored descriptors
export class FaceRecognizer {
  private labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

  addFace(label: string, descriptor: Float32Array) {
    const existing = this.labeledDescriptors.find(ld => ld.label === label);
    if (existing) {
      this.labeledDescriptors = this.labeledDescriptors.map(ld =>
        ld.label === label
          ? new faceapi.LabeledFaceDescriptors(label, [...ld.descriptors, descriptor])
          : ld
      );
    } else {
      this.labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(label, [descriptor])
      );
    }
  }

  recognize(descriptor: Float32Array): { label: string; distance: number } | null {
    if (this.labeledDescriptors.length === 0) return null;
    const matcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.6);
    const match = matcher.findBestMatch(descriptor);
    if (match.label === 'unknown') return null;
    return { label: match.label, distance: match.distance };
  }

  get knownFaces() {
    return this.labeledDescriptors.map(ld => ld.label);
  }

  removeFace(label: string) {
    this.labeledDescriptors = this.labeledDescriptors.filter(ld => ld.label !== label);
  }
}
