![](https://screeps.com/images/logotype-animated.svg)

# My screeps AI

## Flag Names
```
ex-1 to 60
cont
tower-1 to 6
storage
link-source
link-bank
link-controller
spawn
power-spawn
observer-set-{WIDTH}
bank-linker-pos
digger-cont
lab-buffer
lab-reagent-1
lab-reagent-2

sign
sign-all
claim
scavenge-{RESOURCE_AMOUNT}
life-support
no-attack-notify
mute-notify //Mutes rampart attack notificaitons. No way to unmute yet
ignore-scrub
ff-{string} //Console logs all flags with the string in the name
avoid
clear-avoid

tower-aggressive
tower-closest
tower-no-repair

multishard-claim-portal
multishard-claim-target
multishard-claim-laborer


//Holds the launching of nukes until the flag is removed
//Use this to queue launches on the same tick
nuke-hold 
nuke-launch

attack-quick-rally
attack-quick-room-target
attack-pressure-rally
attack-pressure-room-target
attack-prio

profile
profile-function
```
## Creep Says
```
⚡ Energy
🏦 Bank/Storage
💎 Resource
🧪 Reagent
🔬 Lab
⚗️ Compound
☢ Nuker
💪 Power
```

### Room controller levels in a nice format:

| Lvl  | Req        | Other                 | Towers | Links | Spawns | Extensions | Ramparts | Labs |
|------|------------|-----------------------|--------|-------|--------|------------|----------|------|
| 1    | 200        | Roads, 5 Containers   |        |       | 1      |            |          |      |
| 2    | 45,000     | Walls                 |        |       |        | 5 50 cap   | 300K     |      |
| 3    | 135,000    |                       | 1      |       |        | 10 50 cap  | 1M       |      |
| 4    | 405,000    | Storage               |        |       |        | 20 50 cap  | 3M       |      |
| 5    | 1,215,000  |                       | 2      | 2     |        | 30 50 cap  | 10M      |      |
| 6    | 3,645,000  | Extractor, Terminal   |        | 3     |        | 40 50 cap  | 30M      | 3    |
| 7    | 10,935,000 |                       | 3      | 4     | 2      | 50 100 cap | 100M     | 6    |
| 8    | -          | Observer, Power Spawn | 6      | 6     | 3      | 60 200 cap | 300M     | 10   |

### Compounds in a nice format
| Compound          | Reagents              | Cooldown  | Part          | Effect
|-------------------|-----------------------|-----------|---------------|--------
| Base: Prio 0          
| OH                | H + O                 | 20        | -             | -
| ZK                | Z + K                 | 5         | -             | -
| UL                | U + L                 | 5         | -             | -
| Base: Prio 0.5            
| G                 | ZK + UL               | 5         | -             | -
| Tier 1: Prio 1            
| UH                | U + H                 | 10        | ATTACK        | +100% attack effectiveness
| UO                | U + O                 | 10        | WORK          | +200% harvest effectiveness
| KH                | K + H                 | 10        | CARRY         | +50 capacity
| KO                | K + O                 | 10        | RANGED_ATTACK | +100% rangedAttack and rangedMassAttack effectiveness
| LH                | L + H                 | 15 	    | WORK          | +50% repair and build effectiveness without increasing the energy cost
| LO                | L + O                 | 10 	    | HEAL          | +100% heal and rangedHeal effectiveness
| ZH                | Z + H                 | 20 	    | WORK          | +100% dismantle effectiveness
| ZO                | Z + O                 | 10 	    | MOVE          | +100% fatigue decrease speed
| GH                | G + H                 | 10 	    | WORK          | +50% upgradeController effectiveness without increasing the energy cost
| GO                | G + O                 | 10 	    | TOUGH         | -30% damage taken
| Tier 2: Prio 2            
| UH<sub>2</sub>O   | UH + OH               | 5 	    | ATTACK        | +200% attack effectiveness
| UHO<sub>2</sub>   | UO + OH               | 5         | WORK          | +400% harvest effectiveness
| KH<sub>2</sub>O   | KH + OH               | 5 	    | CARRY 	    | +100 capacity
| KHO<sub>2</sub>   | KO + OH               | 5         | RANGED_ATTACK | +200% rangedAttack and rangedMassAttack effectiveness
| LH<sub>2</sub>O   | LH + OH               | 10        | WORK          | +80% repair and build effectiveness without increasing the energy cost
| LHO<sub>2</sub>   | LO + OH               | 5         | HEAL          | +200% heal and rangedHeal effectiveness
| ZH<sub>2</sub>O   | ZH + OH               | 40        | WORK          | +200% dismantle effectiveness
| ZHO<sub>2</sub>   | ZO + OH               | 5         | MOVE          | +200% fatigue decrease speed
| GH<sub>2</sub>O   | GH + OH               | 15        | WORK          | +80% upgradeController effectiveness without increasing the energy cost
| GHO<sub>2</sub>   | GO + OH               | 30        | TOUGH         | -50% damage taken
| Tier 3: Prio 3
| XUH<sub>2</sub>O  | UH<sub>2</sub>O + X   | 60        | ATTACK        | +300% attack effectiveness 
| XUHO<sub>2</sub>  | UHO<sub>2</sub> + X   | 60        | WORK          | +600% harvest effectiveness
| XKH<sub>2</sub>O  | KH<sub>2</sub>O + X   | 60        | CARRY         | +150 capacity
| XKHO<sub>2</sub>  | KHO<sub>2</sub> + X   | 60        | RANGED_ATTACK | +300% rangedAttack and rangedMassAttack effectiveness
| XLH<sub>2</sub>O  | LH<sub>2</sub>O + X   | 65        | WORK          | +100% repair and build effectiveness without increasing the energy cost
| XLHO<sub>2</sub>  | LHO<sub>2</sub> + X   | 60        | HEAL          | +300% heal and rangedHeal effectiveness
| XZH<sub>2</sub>O  | ZH<sub>2</sub>O + X   | 160       | WORK          | +300% dismantle effectiveness
| XZHO<sub>2</sub>  | ZHO<sub>2</sub> + X   | 60        | MOVE          | +300% fatigue decrease speed
| XGH<sub>2</sub>O  | GH<sub>2</sub>O + X   | 80        | WORK          | +100% upgradeController effectiveness without increasing the energy cost
| XGHO<sub>2</sub>  | GHO<sub>2</sub> + X   | 150 	    | TOUGH         | -70% damage taken


### Body parts in a nice format:
```
MOVE	        50	
Decreases fatigue by 2 points per tick.

WORK	        100	
2 energy from source per tick
1 mineral from deposit per tick
Builds structure 5 energy per tick
Repairs structure 100 hits per tick, using 1 energy per tick
Dismantles structure 50 hits per tick, giving 0.25 energy per tick
Upgrades controller 1 energy per tick

CARRY	        50	
50 resource space

ATTACK	        80	
30 hits per tick

RANGED_ATTACK	150	
1-4-10 hits per tick, up to 3 squares away
Not sure if closer or further does more damage

HEAL	        250	
Restores 12 hits per tick
4 hits per tick at distance

CLAIM	        600	
Reserves 1 tick on unclaimed controller
Downgrades timer 300 ticks on hostile controller
Removes 1 tick on unclaimed controller

TOUGH	        10
No affect, just for hit points
```

## Setup
Run `npm install` to get packages

Run `npm start` to compile

Push to master to release