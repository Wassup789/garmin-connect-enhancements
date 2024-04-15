
export type SubstringRange = [number, number];
export type SubstringRangeArrayWithScore = [number, SubstringRange[]];

export default class SearchHelper {
    private static readonly UNDERLINE_OPEN_TAG = "<u>";
    private static readonly UNDERLINE_CLOSE_TAG = "</u>";

    private static readonly SPECIAL_CHARACTERS_REGEX = /[-(),®/]/g;

    static findUsedSubstrings(searchWords: string[], text: string): SubstringRangeArrayWithScore {
        const usedSubstrings: SubstringRange[] = [];

        for (const word of searchWords) {
            let substringRange: SubstringRange = [-1, 0];

            searchLoop:
            while ((substringRange = SearchHelper.findSubstringRangeIn(text, word, substringRange[0] + 1))[0] !== -1) {
                let insertionIndex: number | null = null;
                for (let j = 0; j < usedSubstrings.length; j++) {
                    if (insertionIndex === null && usedSubstrings[j][0] > substringRange[0]) {
                        insertionIndex = j;
                    }

                    if (substringRange[0] >= usedSubstrings[j][0] && usedSubstrings[j][1] > substringRange[0]) {
                        continue searchLoop;
                    }
                }

                usedSubstrings.splice(insertionIndex ?? (usedSubstrings.length), 0, substringRange);
                break;
            }
        }

        return [usedSubstrings.reduce((acc, value) => acc + (value[1] - value[0]), 0), usedSubstrings];
    }

    private static findSubstringRangeIn(haystack: string, needle: string, position: number = 0): SubstringRange {
        outerLoop:
        for (let i = position; i < haystack.length; i++) {
            let offset = 0;

            for (let j = 0; j < needle.length; j++) {
                while (this.SPECIAL_CHARACTERS_REGEX.test(haystack[i + j + offset])) {
                    offset++;
                }

                if (haystack[i + j + offset] !== needle[j]) {
                    continue outerLoop;
                }
            }

            return [i, i + needle.length + offset];
        }

        return [-1, -1];
    }

    static addUnderlineToText(usedSubstrings: SubstringRange[], text: string): string {
        let out = "",
            startIndex = 0;

        for (const [substrStart, substrEnd] of usedSubstrings) {
            out += text.substring(startIndex, substrStart) + SearchHelper.UNDERLINE_OPEN_TAG + text.substring(substrStart, substrEnd) + SearchHelper.UNDERLINE_CLOSE_TAG;
            startIndex = substrEnd;
        }
        out += text.substring(startIndex);

        return out;
    }

    static clean(text: string, removeSpecialCharacters: boolean = false): string {
        const out = text
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return removeSpecialCharacters
            ? out.replace(this.SPECIAL_CHARACTERS_REGEX, "")
            : out;
    }
}
