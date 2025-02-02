import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel
} from "@chakra-ui/accordion";
import { Input } from "@chakra-ui/input";
import { Box, Center, Container, Flex } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import SearchInput from "@components/search/SearchInput";
import SearchResults from "@components/search/SearchResults";
import Switch from "@components/ui/GridListSwitch";
import { GENRE_SUGGESTIONS } from "@lib/constants";
import useManualSWR from "@lib/useManualSWR";
import { buildSearchURL, refillInputs } from "@util/helpers";
import { SearchFormInputs, SearchResponse } from "@util/types";
import Fuse from "fuse.js";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import { useForm } from "react-hook-form";
import { MdArrowDropDown } from "react-icons/md";
import _ from "underscore";

const Search = () => {
	const [query, setQuery] = useState("");
	const [checked, setChecked] = useState(true);
	const [startIndex, setStartIndex] = useState(0);
	const [isSameQuery, setIsSameQuery] = useState(false);
	// Autocomplete states
	const [suggestionValue, setSuggestionValue] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	// form stuff
	const { register, getValues, watch, setValue } = useForm<SearchFormInputs>();
	const { author, publisher, isbn, filter, sort } = watch();
	const router = useRouter();

	const [url, setUrl] = useState("");
	const { data, isValidating, error } = useManualSWR<SearchResponse>(
		url ? `/api/search/${url}` : null
	);

	if (error) console.error(error);

	useEffect(() => {
		const url = router.asPath.split("url=")[1];
		if (!router.asPath.split("url=")[1]) return;

		setUrl(url);
		refillInputs(url, setQuery, setValue, setSuggestionValue);
	}, [router.asPath]);

	useEffect(() => {
		setIsSameQuery(false);
		setStartIndex(0);
	}, [query]);

	useEffect(() => {
		fetchData();

		return () => {
			fetchData.cancel();
		};
	}, [query, author, publisher, suggestionValue, isbn, filter, sort, startIndex]);

	const fetchData = _.debounce(async () => {
		if (query.trim() === "") return;

		const url = buildSearchURL(`q=${encodeURIComponent(query)}`, {
			...getValues(),
			subject: suggestionValue
		});
		setUrl(url + `&startIndex=${startIndex}`);

		router.push(`/search?url=${url}`, undefined, { shallow: true });
	}, 700);

	function getSuggestions(value: string) {
		const fuse = new Fuse(GENRE_SUGGESTIONS, { keys: ["value", "name"] });
		const results = fuse.search(value);

		return results.map((result) => ({
			value: result.item.value,
			name: result.item.name
		}));
	}

	return (
		<>
			<Head>
				<title>Leaf — Search</title>
			</Head>
			<Container py="4" maxW="container.sm">
				<Box as="form" pos="relative">
					<SearchInput value={query} setValue={setQuery} />
					<Accordion allowMultiple mt={2}>
						<AccordionItem>
							<h2>
								<AccordionButton>
									<Box flex="1" textAlign="left">
										Advanced Fields:
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel>
								<Box>
									<Input {...register("author")} variant="flushed" placeholder="Author" />
									<Input {...register("publisher")} variant="flushed" placeholder="Publisher" />
									<Autosuggest
										suggestions={suggestions}
										highlightFirstSuggestion={true}
										onSuggestionsClearRequested={() => setSuggestions([])}
										onSuggestionsFetchRequested={({ value }) => {
											setSuggestionValue(value);
											setSuggestions(getSuggestions(value));
										}}
										getSuggestionValue={(suggestion) => suggestion.name}
										renderSuggestion={(suggestion) => <span>{suggestion.name}</span>}
										inputProps={{
											placeholder: "Genre",
											value: suggestionValue,
											onChange: (_, { newValue }) => {
												setSuggestionValue(newValue);
											},
											className: "chakra-input genre-input"
										}}
									/>
									<Input {...register("isbn")} variant="flushed" placeholder="ISBN" />
								</Box>
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
					<Flex justify="space-between" align="center" my={2}>
						<Select
							icon={<MdArrowDropDown />}
							placeholder="Filter By:"
							cursor="pointer"
							{...register("filter")}
						>
							<option value="&printType=books">Books</option>
							<option value="&printType=magazines">Magazines</option>
							<option value="&filter=ebooks">Ebooks</option>
							<option value="&filter=free-ebooks">Free Ebooks</option>
							<option value="&filter=paid-ebooks">Paid Ebooks</option>
						</Select>
						<Select
							{...register("sort")}
							icon={<MdArrowDropDown />}
							placeholder="Sort By:"
							cursor="pointer"
						>
							<option value="&orderBy=relevance">Relevance</option>
							<option value="&orderBy=newest">Newest</option>
						</Select>
					</Flex>
					<Box pos="absolute" right="0">
						<Switch checked={checked} handleChange={(bool) => setChecked(bool)} />
					</Box>
				</Box>
				<SearchResults
					results={data}
					loading={isValidating}
					type={checked ? "GRID" : "LIST"}
					isSameQuery={isSameQuery}
				/>
				{data?.items?.length > 0 && (
					<Center my="6">
						<Button
							onClick={() => {
								setIsSameQuery(true);
								setStartIndex((p) => p + 40);
							}}
							variant="solid"
							width="60%"
							colorScheme="blue"
						>
							Load More
						</Button>
					</Center>
				)}
			</Container>
		</>
	);
};

export default Search;
