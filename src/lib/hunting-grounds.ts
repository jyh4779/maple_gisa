export type HuntingGround = {
  name: string;
  area: string;
  minLevel: number;
  maxLevel: number;
};

export const HUNTING_GROUNDS: HuntingGround[] = [
  // 헤네시스
  { name: "헤네시스 사냥터1", area: "헤네시스", minLevel: 8, maxLevel: 13 },
  { name: "헤네시스 왼쪽사냥터1", area: "헤네시스", minLevel: 13, maxLevel: 21 },
  { name: "헤네시스 왼쪽사냥터2", area: "헤네시스", minLevel: 13, maxLevel: 21 },
  { name: "헤네시스 왼쪽사냥터3", area: "헤네시스", minLevel: 13, maxLevel: 21 },

  // 엘리니아
  { name: "엘리니아 남쪽숲 나무던전1", area: "엘리니아", minLevel: 8, maxLevel: 13 },

  // 슬리피우드
  { name: "슬리피우드 개미굴1", area: "슬리피우드", minLevel: 21, maxLevel: 30 },
  { name: "슬리피우드 개미굴2 미니던전", area: "슬리피우드", minLevel: 21, maxLevel: 30 },
  { name: "슬리피우드 미니던전2", area: "슬리피우드", minLevel: 41, maxLevel: 50 },
  { name: "슬리피우드 미니던전3", area: "슬리피우드", minLevel: 41, maxLevel: 50 },
  { name: "슬리피우드 미니던전4 골렘숲", area: "슬리피우드", minLevel: 50, maxLevel: 70 },

  // 커닝시티
  { name: "커닝스퀘어 CD", area: "커닝시티", minLevel: 52, maxLevel: 70 },

  // 오르비스
  { name: "오르비스 산책로2", area: "오르비스", minLevel: 45, maxLevel: 52 },
  { name: "오르비스 구름공원6", area: "오르비스", minLevel: 52, maxLevel: 82 },

  // 루디브리엄
  { name: "루디브리엄 시간의 길1", area: "루디브리엄", minLevel: 38, maxLevel: 47 },
  { name: "루디브리엄 시간의 길4", area: "루디브리엄", minLevel: 47, maxLevel: 55 },
  { name: "루디브리엄 사라진 시간", area: "루디브리엄", minLevel: 74, maxLevel: 85 },
  { name: "루디브리엄 잊혀진 시간의 길", area: "루디브리엄", minLevel: 77, maxLevel: 82 },
  { name: "루디브리엄 삐뚤어진 시간", area: "루디브리엄", minLevel: 82, maxLevel: 120 },
  { name: "루디브리엄 잃어버린 시간의 길3 데스티니", area: "루디브리엄", minLevel: 85, maxLevel: 90 },
  { name: "루디브리엄 뒤틀린 시간의 길4 바이킹", area: "루디브리엄", minLevel: 90, maxLevel: 150 },

  // 마가티아
  { name: "마가티아 C1", area: "마가티아", minLevel: 50, maxLevel: 70 },
  { name: "마가티아 C2", area: "마가티아", minLevel: 60, maxLevel: 80 },

  // 아랫마을
  { name: "아랫마을 까막산 입구", area: "아랫마을", minLevel: 43, maxLevel: 53 },

  // 엘나스
  { name: "엘나스 죽은 나무의 숲1", area: "엘나스", minLevel: 52, maxLevel: 82 },
  { name: "엘나스 죽은 나무의 숲2", area: "엘나스", minLevel: 52, maxLevel: 82 },
  { name: "엘나스 죽은 나무의 숲3", area: "엘나스", minLevel: 52, maxLevel: 82 },
  { name: "엘나스 죽은 나무의 숲4", area: "엘나스", minLevel: 52, maxLevel: 82 },
  { name: "엘나스 차디찬 벌판", area: "엘나스", minLevel: 60, maxLevel: 80 },

  // 무릉
  { name: "빨간코 해적단 소굴2", area: "무릉", minLevel: 75, maxLevel: 120 },
  { name: "빨간코 해적단 소굴3", area: "무릉", minLevel: 75, maxLevel: 120 },

  // 미나르숲
  { name: "미나르숲 하늘둥지 입구", area: "미나르숲", minLevel: 81, maxLevel: 90 },
  { name: "미나르숲 불과 어둠의 전장", area: "미나르숲", minLevel: 83, maxLevel: 110 },
  { name: "미나르숲 붉은 켄타로우스 영역", area: "미나르숲", minLevel: 85, maxLevel: 110 },
  { name: "미나르숲 숲의 갈림길", area: "미나르숲", minLevel: 90, maxLevel: 100 },
  { name: "미나르숲 블루 와이번 둥지", area: "미나르숲", minLevel: 96, maxLevel: 160 },
  { name: "미나르숲 협곡의 동쪽길", area: "미나르숲", minLevel: 98, maxLevel: 160 },
  { name: "미나르숲 망가진 용의 둥지", area: "미나르숲", minLevel: 80, maxLevel: 200 },

  // 아쿠아리움
  { name: "깊은 바다 협곡2", area: "아쿠아리움", minLevel: 90, maxLevel: 120 },
  { name: "위험한 바다 협곡2", area: "아쿠아리움", minLevel: 100, maxLevel: 120 },

  // 리프레
  { name: "리프레 시간의 신전", area: "리프레", minLevel: 110, maxLevel: 200 },

  // 개인사냥터
  { name: "부활하는 기억", area: "개인사냥터", minLevel: 80, maxLevel: 200 },
  { name: "남겨진 용의 둥지", area: "개인사냥터", minLevel: 80, maxLevel: 200 },
  { name: "뉴트보호구역", area: "개인사냥터", minLevel: 80, maxLevel: 200 },
  { name: "보물섬의 약탈", area: "개인사냥터", minLevel: 80, maxLevel: 200 },
  { name: "사헬지대1", area: "개인사냥터", minLevel: 80, maxLevel: 200 },
  { name: "연구소 C-1 구역", area: "개인사냥터", minLevel: 80, maxLevel: 200 },
];

export const HUNTING_GROUND_NAMES = HUNTING_GROUNDS.map((g) => g.name);

export const HUNTING_GROUND_AREAS = [
  ...new Set(HUNTING_GROUNDS.map((g) => g.area)),
];
