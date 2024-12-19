import type { finalFace, Spin } from '$lib/entities';
import { generateClientSeed, hmacSHA256 } from '../utils';
import { addMoney } from '../auth';



export class Slots {
	public getBet() {
		return this.bet;
	    }

	//chance zu gewinnMulti

	symbols = {
		lo: {
			"java": { chance: 0.25, multiplier: 4 },  // Most frequent
			"html": { chance: 0.20, multiplier: 5 },
			"go": { chance: 0.15, multiplier: 7 },
			"github": { chance: 0.12, multiplier: 10 },
			"intellij": { chance: 0.10, multiplier: 15 },
			"vsc": { chance: 0.10, multiplier: 20 },
			"c": { chance: 0.08, multiplier: 25 }   // Least frequent in `lo`
		},

		mid: {
			"swift": { chance: 0.30, multiplier: 40 },  // Most frequent in `mid`
			"mongodb": { chance: 0.25, multiplier: 50 },
			"css": { chance: 0.20, multiplier: 60 },
			"python": { chance: 0.15, multiplier: 80 },
			"discord": { chance: 0.10, multiplier: 100 }  // Least frequent in `mid`
		},

		hi: {
			"arch": { chance: 0.40, multiplier: 500 },  // Most frequent in `hi`
			"rust": { chance: 0.35, multiplier: 750 },
			"linux": { chance: 0.25, multiplier: 1000 } // Least frequent, highest payout
		}
	}


	private money:number = 100;
	private bet:number = 5;
	private win:number = 0;
	private winMulti:number = 0;
	private winType:string = "";
	private winSymbol: string = "";
	private history: object[] = [];
	private clientSeed: string = generateClientSeed();
	private nonce: number = 0;
	private oldMoney: number = 0;
	private totalProfit: number = 0;
	private totalSpins: number = 0;
	private tempBorders: string[][][] = [[[], [], []], [[], [], []], [[], [], []]];
	private combo: number = 0;

	private currSpin: Spin = {
		lane1: [],
		lane2: [],
		lane3: [],
		winIndex1: 0,
		winIndex2: 0,
		winIndex3: 0,
		finalFace: {
			1: {
				1: "",
				2: "",
				3: ""
			},
			2: {
				1: "",
				2: "",
				3: ""
			},
			3: {
				1: "",
				2: "",
				3: ""
			}
		},
		combo: 0,
		moneyWon: 0,
		borders: [[[], [], []], [[], [], []], [[], [], []]],
	}

	public constructor(money: number) {
		this.money = money;
		this.currSpin = {
			lane1: [this.generateRandomSymbol(), this.generateRandomSymbol(), this.generateRandomSymbol()],
			lane2: [this.generateRandomSymbol(), this.generateRandomSymbol(), this.generateRandomSymbol()],
			lane3: [this.generateRandomSymbol(), this.generateRandomSymbol(), this.generateRandomSymbol()],
			winIndex1: 0,
			winIndex2: 0,
			winIndex3: 0,
			finalFace: {
				1: {
					1: "1",
					2: "2",
					3: "3"
				},
				2: {
					1: "4",
					2: "5",
					3: "6"
				},
				3: {
					1: "7",
					2: "8",
					3: "9"
				}
			},
			moneyWon: 0,
			borders: [[[], [], []], [[], [], []], [[], [], []]],
			combo: 0
		}
	}

	public getCurrentSpin(): Spin {
		return this.currSpin;
	}

	public setBet(bet: number): void {
		if (bet > this.money) {
			throw new Error("Not enough money");
		}
		this.bet = bet;
		console.log("bet set to: ", this.bet);
	}

	public async spin(): Promise<void> {
		if (this.bet > this.money) {
			this.bet = this.money;
			if (this.bet === 0) {
				throw new Error("Not enough money");
			}
		}
		this.oldMoney = this.money;
		this.win = 0;
		this.combo = 0;
		this.money -= this.bet;
		
		let random = this.genNum();
		const len = 150 + Math.floor(random * 150);

		random = this.genNum();
		const winIndex1 = Math.floor(random * (len - 2));
		random = this.genNum();
		const winIndex2 = Math.floor(random * (len - 2));
		random = this.genNum();
		const winIndex3 = Math.floor(random * (len - 2));

		let lane1 = new Array(len).fill(0).map(() => this.generateRandomSymbol());
		let lane2 = new Array(len).fill(0).map(() => this.generateRandomSymbol());
		let lane3 = new Array(len).fill(0).map(() => this.generateRandomSymbol());



		let finalFace: finalFace = {
			1: {
				1: lane1[(winIndex1 + 2) % (len - 3)],
				2: lane1[(winIndex1 + 1) % (len - 3)],
				3: lane1[winIndex1]
			},
			2: {
				1: lane2[(winIndex2 + 2) % (len - 3)],
				2: lane2[(winIndex2 + 1) % (len - 3)],
				3: lane2[winIndex2]
			},
			3: {
				1: lane3[(winIndex3 + 2) % (len - 3)],
				2: lane3[(winIndex3 + 1) % (len - 3)],
				3: lane3[winIndex3]
			}
		};

		console.log();


		console.log("------------");
		console.log(finalFace[1][1], "\t", finalFace[2][1], "\t", finalFace[3][1]);
		console.log(finalFace[1][2], "\t", finalFace[2][2], "\t", finalFace[3][2]);
		console.log(finalFace[1][3], "\t", finalFace[2][3], "\t", finalFace[3][3]);
		console.log("------------");

		this.calcWin(finalFace);
		this.win += this.bet * this.winMulti;
		this.money += this.win;
		this.totalProfit += this.win - this.bet;
		this.totalSpins++;
		console.log("------------");
		console.log("winType: ", this.winType);
		console.log("bet: ", this.bet);
		console.log("win: ", this.win);
		console.log("money: ", this.money);
		console.log("totalProfit: ", this.totalProfit);
		console.log("totalSpins: ", this.totalSpins);
		console.log("multiplayer: ", this.winMulti);
		console.log("------------");


		this.currSpin = {
			lane1: lane1,
			lane2: lane2,
			lane3: lane3,
			winIndex1: winIndex1,
			winIndex2: winIndex2,
			winIndex3: winIndex3,
			finalFace: finalFace,
			moneyWon: this.win,
			borders: this.tempBorders,
			combo: this.combo
		};

		console.log("2");

		this.history.push({
			spin: this.currSpin,
			win: this.win,
			money: this.money,
			oldMoney: this.oldMoney,
			winType: this.winType,
			winSymbol: this.winSymbol,
			multiplayer: this.winMulti
		});



		

		return;
	}

	private calcWin(currSpin: finalFace) {
		//all possible win combinations
		// - 3 in a row in any lane
		// - 3 in a row in any column
		// - 3 in a row diagonally
		// - 3 in a row in a "V" shape -_-
		// - 3 in a col in a "V" shape -_-
		//every win has its own multiplier and the win multiplayer is added to the this.winMulti
		
		this.tempBorders = [[[], [], []], [[], [], []], [[], [], []]];
		this.winType = "";
		this.winSymbol = "";
		this.winMulti = 1;

		let colors = [
			"#FF0000", // Red
			"#00FF00", // Green
			"#0000FF", // Blue
			"#FFFF00", // Yellow
			"#FF00FF", // Magenta
			"#00FFFF", // Cyan
			"#800000", // Maroon
			"#808000", // Olive
			"#008000", // Dark Green
			"#800080", // Purple
			"#008080", // Teal
			"#000080", // Navy
			"#FFA500", // Orange
			"#A52A2A", // Brown
			"#8A2BE2", // Blue Violet
			"#5F9EA0", // Cadet Blue
			"#D2691E", // Chocolate
			"#FF7F50", // Coral
			"#6495ED", // Cornflower Blue
			"#DC143C"  // Crimson
		];
		// lane cases
		// lane 1
		if (currSpin[1][1] === currSpin[1][2] && currSpin[1][2] === currSpin[1][3]) {
			this.winType = "lane";
			this.winSymbol = currSpin[1][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][1]);
			let color = colors.pop() || "#000000";

			this.tempBorders[this.combo][0][0]=color;
			this.tempBorders[this.combo][0][1]=color;
			this.tempBorders[this.combo][0][2] = color;
			
			this.combo += 1;
		}
		// lane 2
		if (currSpin[2][1] === currSpin[2][2] && currSpin[2][2] === currSpin[2][3]) {
			this.winType = "lane";
			this.winSymbol = currSpin[2][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[2][1]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][1][0]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][1][2]=color;
			this.combo += 1;
		}
		// lane 3
		if (currSpin[3][1] === currSpin[3][2] && currSpin[3][2] === currSpin[3][3]) {
			this.winType = "lane";
			this.winSymbol = currSpin[3][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[3][1]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][2][0]=color;
			this.tempBorders[this.combo][2][1]=color;
			this.tempBorders[this.combo][2][2]=color;
			this.combo += 1;
		}

		// column cases
		// column 1
		if (currSpin[1][1] === currSpin[2][1] && currSpin[2][1] === currSpin[3][1]) {
			this.winType = "column";
			this.winSymbol = currSpin[1][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][1]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][0]=color;
			this.tempBorders[this.combo][1][0]=color;
			this.tempBorders[this.combo][2][0]=color;
			this.combo += 1;
		}
		// column 2
		if (currSpin[1][2] === currSpin[2][2] && currSpin[2][2] === currSpin[3][2]) {
			this.winType = "column";
			this.winSymbol = currSpin[1][2];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][2]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][1]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][1]=color;
			this.combo += 1;
		}
		// column 3
		if (currSpin[1][3] === currSpin[2][3] && currSpin[2][3] === currSpin[3][3]) {
			this.winType = "column";
			this.winSymbol = currSpin[1][3];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][3]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][2]=color;
			this.tempBorders[this.combo][1][2]=color;
			this.tempBorders[this.combo][2][2]=color;
			this.combo += 1;
		}

		// diagonal cases
		// diagonal 1
		if (currSpin[1][1] === currSpin[2][2] && currSpin[2][2] === currSpin[3][3]) {
			this.winType = "diagonal";
			this.winSymbol = currSpin[1][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][1]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][0]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][2]=color;
			this.combo += 1;
		}
		// diagonal 2
		if (currSpin[1][3] === currSpin[2][2] && currSpin[2][2] === currSpin[3][1]) {
			this.winType = "diagonal";
			this.winSymbol = currSpin[1][3];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][3]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][2]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][0]=color;
			this.combo += 1;
		}

		// V cases
		// V top mid top
		if (currSpin[1][2] === currSpin[2][1] && currSpin[2][1] === currSpin[3][2]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][2];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][2]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][1]=color;
			this.tempBorders[this.combo][1][0]=color;
			this.tempBorders[this.combo][2][1]=color;
			this.combo += 1;
		}
		// V mid top mid
		if (currSpin[1][1] === currSpin[2][2] && currSpin[2][2] === currSpin[3][1]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][1]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][0]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][0]=color;
			this.combo += 1;
		}
		// V mid bot mid
		if (currSpin[1][2] === currSpin[2][3] && currSpin[2][3] === currSpin[3][2]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][3];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][3]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][1]=color;
			this.tempBorders[this.combo][1][2]=color;
			this.tempBorders[this.combo][2][1]=color;
			this.combo += 1;
		}
		// V bot mid bot
		if (currSpin[1][3] === currSpin[2][2] && currSpin[2][2] === currSpin[3][3]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][2];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][2]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][2]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][2]=color;
			this.combo += 1;
		}
		// Side V cases
		// V left mid left
		if (currSpin[1][1] === currSpin[2][2] && currSpin[2][2] === currSpin[3][3]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][1];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][1]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][0]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][2]=color;
			this.combo += 1;
		}
		// V mid left mid
		if (currSpin[1][2] === currSpin[2][3] && currSpin[2][3] === currSpin[3][2]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][2];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][2]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][1]=color;
			this.tempBorders[this.combo][1][2]=color;
			this.tempBorders[this.combo][2][1]=color;
			this.combo += 1;
		}
		// V mid right mid
		if (currSpin[1][2] === currSpin[2][1] && currSpin[2][1] === currSpin[3][2]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][2];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][2]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][1]=color;
			this.tempBorders[this.combo][1][0]=color;
			this.tempBorders[this.combo][2][1]=color;
			this.combo += 1;
		}
		// V right mid right
		if (currSpin[1][3] === currSpin[2][2] && currSpin[2][2] === currSpin[3][1]) {
			this.winType = "V";
			this.winSymbol = currSpin[1][3];
			//@ts-ignore
			this.winMulti *= this.getWinMultiplier(currSpin[1][3]);
			let color = colors.pop() || "#000000";


			this.tempBorders[this.combo][0][2]=color;
			this.tempBorders[this.combo][1][1]=color;
			this.tempBorders[this.combo][2][0]=color;
			this.combo += 1;
		}
		//if no win
		if (this.winType === "") {
			this.winType = "noWin";
			this.winMulti = 0;
		}
		return;
	}

	private getWinMultiplier(symbol: string): number {
		// @ts-ignore
		return this.symbols.lo[symbol].multiplier || this.symbols.mid[symbol].multiplier || this.symbols.hi[symbol].multiplier;
	}

	public getMoney(): number {
		return this.money;
	}

	public getWin(): number {
		return this.win;
	}

	public getWinMulti(): number {
		return this.winMulti;
	}

	public getWinType(): string {
		return this.winType;
	}

	public getWinSymbol(): string {
		return this.winSymbol;
	}

	public getOldMoney(): number {
		return this.oldMoney;
	}

	public getHistory(): object[] {
		return this.history;
	}

	private getRandomSymbolFromGrade(grade: { [key: string]: { chance: number, multiplier: number } }): string {
		const random = this.genNum();
		let cumulative = 0;

		for (const symbol in grade) {
			cumulative += grade[symbol].chance;
			if (random < cumulative) {
				return symbol;
			}
		}
		console.log("something is wrong");

		// Fallback in case of rounding errors
		return Object.keys(grade)[0];
	}

	private generateRandomSymbol(): string {
		const random = this.genNum();
		let grade = random < 0.75 ? this.symbols.lo : random < 0.95 ? this.symbols.mid : this.symbols.hi;
		const symbol = this.getRandomSymbolFromGrade(grade);
		return symbol;
	}

	private genNum(): number {
		const hash = hmacSHA256(this.clientSeed, this.nonce);
		const first8Chars = hash.slice(0, 8);
		const randomNumber = parseInt(first8Chars, 16) / 0xFFFFFFFF; // Normalize to a number between 0 and 1
		this.nonce++;
		return randomNumber; // Return a number between 0 and 1
	}
}



export default Slots;