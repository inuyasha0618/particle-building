import { Vector2, Vector3 } from 'three';

interface CvsInfo {
    left: number;
    top: number;
    width: number;
    height: number;
}

export default class GlobalState {
    private mousePos2D: Vector2 = new Vector2(0.0, 0.0);
    private spherePos3D: Vector3 = new Vector3(0.0, 0.0, 0.0);
    private lastFrameSpherePos3D: Vector3 = new Vector3(0.0, 0.0, 0.0);
    private isPhysicActive: boolean = false;
    readonly sphereRadius: number = 5.0;
    private velocity: Vector3 = new Vector3(0.0, 0.0, 0.0);
    canvasInfo: CvsInfo = { left: 0.0, top: 0.0, width: 0.0, height: 0.0 };

    constructor(left: number, top: number, width: number, height: number) {
        this.setCanvasPos(left, top, width, height);
    }

    setMousePos2D(x: number, y: number) {
        this.mousePos2D.set(x, y);
        return this;
    }

    getMousePos2D(): Vector2 {
        return this.mousePos2D;
    }
    private updateLastFrameSpherePos3D() {
        this.lastFrameSpherePos3D.copy(this.spherePos3D);
    }

    public updateSpherePos3D(newPos3D: Vector3) {
        this.updateLastFrameSpherePos3D();
        this.spherePos3D.copy(newPos3D);
        return this;
    }

    public getSephereVelocity(): Vector3 {
        this.velocity.subVectors(this.spherePos3D, this.lastFrameSpherePos3D);
        return this.velocity; 
    }

    public getSpherePos3D(): Vector3 {
        return this.spherePos3D;
    }

    public setIsPhysicActive(newState: boolean) {
        this.isPhysicActive = newState;
        return this;
    }

    public getIsPhysicActive(): boolean {
        return this.isPhysicActive;
    }

    public setCanvasPos(left: number, top: number, width: number, height: number): GlobalState {
        this.canvasInfo.left = left;
        this.canvasInfo.top = top;
        this.canvasInfo.width = width;
        this.canvasInfo.height = height;
        return this;
    }

    public getCanvasInfo(): CvsInfo {
        return this.canvasInfo;
    }
}