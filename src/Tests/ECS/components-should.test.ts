import { test, expect } from '@jest/globals';
import { PlayerFlagsComponent } from '../../ECS/Components/PlayerStateFlags';
import { VelocityComponent } from '../../ECS/Components/Velocity';
import { ECBComponent } from '../../ECS/Components/ECB';
import { LedgeDetectorComponent } from '../../ECS/Components/LedgeDetector';
import { cloneFlatVecArray } from '../../Game/GameState/Clone';
import { ECSBuilderExtension } from '../../ECS/Extensions/ECSBuilderExtensions';
import { ECS } from '../../ECS/ECS';

test('playerflags should change', () => {
  const comp = new PlayerFlagsComponent();

  comp.FaceRight();
  expect(comp.IsFacingRight()).toBeTruthy;
  expect(comp.IsFacingLeft()).toBeFalsy;
  comp.FaceLeft();
  expect(comp.IsFacingRight()).toBeFalsy;
  expect(comp.IsFacingLeft()).toBeTruthy;

  comp.Ground();
  expect(comp.IsGrounded()).toBeTruthy;
  comp.Unground();
  expect(comp.IsGrounded()).toBeTruthy;

  comp.GrabLedge();
  expect(comp.IsInLedgeGrab()).toBeTruthy;
  comp.UnGrabLedge();
  expect(comp.IsInLedgeGrab()).toBeFalsy;
});

test('velocity should add clamped x impulses', () => {
  const comp = new VelocityComponent();

  // Just add five with a clamp of 20
  comp.AddCalmpedXImpulse(20, 5);
  expect(comp.Vel.X).toEqual(5);

  //Set velocity above clamp and prove comp won't add to the velocity
  comp.Vel.X = 25;
  comp.AddCalmpedXImpulse(20, 5);
  expect(comp.Vel.X).toEqual(25);

  //Set velocity just below clamp, prove addition will add to the velocity up to the limit of the clamp.
  comp.Vel.X = 18;
  comp.AddCalmpedXImpulse(20, 5);
  expect(comp.Vel.X).toEqual(20);
});

test('ECB Should update positions of verticies', () => {
  const comp = new ECBComponent();

  const originalVerts = cloneFlatVecArray(comp.GetVerticies());
  comp.MoveToPosition(1, 1);
  const newVerts = cloneFlatVecArray(comp.GetVerticies());

  for (let index = 0; index < newVerts.length; index++) {
    const newV = newVerts[index];
    const oldV = originalVerts[index];

    expect(newV.X).not.toEqual(oldV.X);
    expect(newV.Y).not.toEqual(oldV.Y);

    expect(newV.X).toEqual(oldV.X + 1);
    expect(newV.Y).toEqual(oldV.Y + 1);
  }
});

test('Ledge Detector Should update position of verticies', () => {
  const comp = new LedgeDetectorComponent(0, 0, 30, 70);

  const preUpdateVerts = [
    ...cloneFlatVecArray(comp.GetLeftSideDetectorVerts()),
    ...cloneFlatVecArray(comp.GetRightSideDetectorVerts()),
  ];

  comp.MoveTo(1, 1);

  const postUpdateVerts = [
    ...cloneFlatVecArray(comp.GetLeftSideDetectorVerts()),
    ...cloneFlatVecArray(comp.GetRightSideDetectorVerts()),
  ];

  const vLength = postUpdateVerts.length;

  for (let index = 0; index < vLength; index++) {
    const pre = preUpdateVerts[index];
    const post = postUpdateVerts[index];

    expect(post.X).toBeGreaterThan(pre.X);
    expect(post.Y).toBeGreaterThan(pre.Y);
  }
});

test('Unboxed Player', () => {
  const ecs = new ECS();
  const ext = new ECSBuilderExtension();
  ecs.ExtendEcs(ext);
  const player = ext.BuildDefaultPlayer();
});
