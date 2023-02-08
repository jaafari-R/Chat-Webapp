export class Helpers {
    static firstLetterUppercase(str: string): string {
        const valueString = str.toLowerCase();
        return valueString
            .split(' ')
            .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
            .join(' ');
    }

    static lowerCase(str: string): string {
        return str.toLowerCase();
    }

    static generateRandomInt(intLength: number): number {
        let result = 0;
        for (let i = 0; i < intLength; ++i) {
            result *= 10;
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }
}
