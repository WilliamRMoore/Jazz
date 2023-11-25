import { ECS, component, entity, position, velocity } from '../../experiment';
import { beforeEach, test } from '@jest/globals';
let ecs: ECS;

beforeEach(() => {
  ecs = new ECS();

  ecs.RegisterSingletonComponent('pos', { x: 0, y: 0 } as position);
  ecs.RegisterSingletonComponent('vel', { xv: 0, yv: 0 } as velocity);
  ecs.RegisterSingletonComponent('honk', {
    honk: () => {
      console.log('HONK!');
    },
  } as honk);

  ecs.RegisterComponentFactory('NameAndAdd', () => {
    return { name: 'Will', address: '1701' } as nameAndAdd;
  });

  const eID1 = ecs.CreateEntiity();
  const eID2 = ecs.CreateEntiity();
  const eID3 = ecs.CreateEntiity();

  ecs.AddSingltonComponentToEntityID(eID1, 'pos');
  ecs.AddComponentToEntityID(eID1, 'NameAndAdd');
  ecs.AddComponentToEntityID(eID2, 'NameAndAdd');
  ecs.AddSingltonComponentToEntityID(eID2, 'vel');
  ecs.AddSingltonComponentToEntityID(eID2, 'honk');
  ecs.AddSingltonComponentToEntityID(eID3, 'pos');
  ecs.AddSingltonComponentToEntityID(eID3, 'vel');
});

test('', () => {
  let res = ecs.QueryECS('pos');

  let c = res.get(0)?.Components.get('pos') as position;
  let c2 = res.get(2)?.Components.get('vel') as velocity;
  c.x++;

  c2.yv++;

  let res2 = ecs.QueryECS('honk');

  res2.forEach((e) => {
    const c3 = e.Components.get('honk') as honk;
    c3.honk();
  });

  let res3 = ecs.QueryECS('NameAndAdd');

  let c4 = res3.get(0)?.Components.get('NameAndAdd') as nameAndAdd;
  c4.name = 'Wiliam Moore';
  c4.address = '123 Apple Court';

  res3.forEach((e) => {
    const c5 = e.Components.get('NameAndAdd') as nameAndAdd;
    console.log(c5.name + ' ' + c5.address);
  });
});

type honk = {
  honk: () => void;
};

type nameAndAdd = {
  name: string;
  address: string;
};
